"use server";

import { prisma, withDatabaseRetry } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmationEmail } from "@/actions/email";

const ALLOWED_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const;

type CheckoutResult = {
  success: boolean;
  orderId?: string;
  deduplicated?: boolean;
  error?: string;
};

// Mutex em memória (globalThis) contra ataques de Concorrência / Race Condition (TOCTOU) no Checkout
const globalForCheckoutMutex = globalThis as unknown as {
  activeCheckoutLocks?: Map<string, Promise<CheckoutResult>>;
  processedIdempotencyKeys?: Map<string, { orderId: string; timestamp: number }>;
};

const activeCheckoutLocks =
  globalForCheckoutMutex.activeCheckoutLocks ?? new Map<string, Promise<CheckoutResult>>();
const processedIdempotencyKeys =
  globalForCheckoutMutex.processedIdempotencyKeys ??
  new Map<string, { orderId: string; timestamp: number }>();

globalForCheckoutMutex.activeCheckoutLocks = activeCheckoutLocks;
globalForCheckoutMutex.processedIdempotencyKeys = processedIdempotencyKeys;

export async function createOrder(
  productId: string,
  couponId?: string,
  idempotencyKey?: string
): Promise<CheckoutResult> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Você precisa estar logado para fazer um pedido." };
    }

    const userId = session.user.id as string;
    const lockKey = `${userId}:${productId}`;

    // 1. Verificação instantânea por Chave de Idempotência (Token único por sessão de checkout)
    if (idempotencyKey) {
      const cached = processedIdempotencyKeys.get(idempotencyKey);
      if (cached && Date.now() - cached.timestamp < 60_000) {
        return {
          success: true,
          orderId: cached.orderId,
          deduplicated: true,
        };
      }
    }

    // 2. Mutex contra Race Condition (TOCTOU): se já existe uma requisição em voo no mesmo milissegundo,
    // coalescemos a resposta sem abrir uma segunda transação concorrente no PostgreSQL
    const inFlightPromise = activeCheckoutLocks.get(lockKey);
    if (inFlightPromise) {
      const firstResult = await inFlightPromise;
      return {
        ...firstResult,
        deduplicated: true,
      };
    }

    const executionPromise = (async (): Promise<CheckoutResult> => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isAvailable) {
        return { success: false, error: "Produto indisponível." };
      }

      // 3. Guarda de idempotência no PostgreSQL (janela de 15s)
      const duplicateWindow = new Date(Date.now() - 15_000);
      const existingRecentOrder = await prisma.order.findFirst({
        where: {
          userId,
          productId: product.id,
          status: "PENDING",
          createdAt: { gte: duplicateWindow },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingRecentOrder) {
        if (idempotencyKey) {
          processedIdempotencyKeys.set(idempotencyKey, {
            orderId: existingRecentOrder.id,
            timestamp: Date.now(),
          });
        }
        return {
          success: true,
          orderId: existingRecentOrder.id,
          deduplicated: true,
        };
      }

      // 4. Transação ACID com atualização atômica de cupom contra condição de corrida
      const order = await withDatabaseRetry(
        () =>
          prisma.$transaction(async (tx) => {
            let totalAmount = product.price;
            let appliedCouponId: string | null = null;

            if (couponId) {
              const coupon = await tx.coupon.findUnique({ where: { id: couponId } });

              const expired = coupon?.expiryDate ? coupon.expiryDate < new Date() : false;
              const exhausted =
                coupon?.usageLimit != null ? coupon.usedCount >= coupon.usageLimit : false;

              if (!coupon || !coupon.isActive || expired || exhausted) {
                throw new Error("COUPON_INVALID");
              }

              // Incremento condicional atômico (impede que duas transações paralelas estourem o limite)
              if (coupon.usageLimit != null) {
                const updated = await tx.coupon.updateMany({
                  where: {
                    id: coupon.id,
                    isActive: true,
                    usedCount: { lt: coupon.usageLimit },
                  },
                  data: { usedCount: { increment: 1 } },
                });
                if (updated.count === 0) {
                  throw new Error("COUPON_INVALID");
                }
              } else {
                await tx.coupon.update({
                  where: { id: coupon.id },
                  data: { usedCount: { increment: 1 } },
                });
              }

              totalAmount =
                coupon.discountType === "PERCENTAGE"
                  ? totalAmount - totalAmount * (coupon.discountValue / 100)
                  : totalAmount - coupon.discountValue;
              if (totalAmount < 0) totalAmount = 0;

              appliedCouponId = coupon.id;
            }

            return tx.order.create({
              data: {
                userId,
                productId: product.id,
                status: "PENDING",
                totalAmount,
                couponId: appliedCouponId,
              },
            });
          }),
        { operationName: "order.createOrderTransaction" }
      );

      if (idempotencyKey) {
        processedIdempotencyKeys.set(idempotencyKey, {
          orderId: order.id,
          timestamp: Date.now(),
        });
      }

      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/pedidos");
      revalidatePath("/minha-conta");

      return { success: true, orderId: order.id, deduplicated: false };
    })();

    activeCheckoutLocks.set(lockKey, executionPromise);
    try {
      return await executionPromise;
    } finally {
      activeCheckoutLocks.delete(lockKey);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "COUPON_INVALID") {
      return {
        success: false,
        error: "Cupom inválido, expirado ou esgotado. Remova-o e tente novamente.",
      };
    }
    console.error(error);
    return { success: false, error: "Erro ao processar pedido." };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return {
        success: false,
        error: "Acesso negado. Apenas administradores podem alterar o status.",
      };
    }

    if (!orderId || !ALLOWED_STATUSES.includes(newStatus as any)) {
      return { success: false, error: "Status de pedido inválido." };
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true, user: true },
    });

    if (!existingOrder) {
      return { success: false, error: "Pedido não encontrado no banco de dados." };
    }

    const previousStatus = existingOrder.status;

    // Guarda de idempotência: evita re-execução caso o status já esteja igual no banco
    if (previousStatus === newStatus) {
      return {
        success: true,
        orderId: existingOrder.id,
        previousStatus,
        newStatus,
        deduplicated: true,
        customerName: existingOrder.user?.name || "Cliente",
        productName: existingOrder.product?.name || "Software",
        updatedAt: existingOrder.updatedAt.toISOString(),
      };
    }

    const updatedOrder = await withDatabaseRetry(
      () =>
        prisma.$transaction(async (tx) => {
          const updated = await tx.order.update({
            where: { id: orderId },
            data: { status: newStatus },
          });

          // Quando o pedido transita para COMPLETED pela primeira vez, atualiza estoque e cria assinatura SaaS se aplicável
          if (newStatus === "COMPLETED" && previousStatus !== "COMPLETED" && existingOrder.product) {
            await tx.product.update({
              where: { id: existingOrder.productId },
              data: { stock: { decrement: existingOrder.quantity } },
            });

            if (existingOrder.product.isSubscription) {
              const nextBillingDate = new Date();
              if (existingOrder.product.billingCycle === "YEARLY") {
                nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
              } else {
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
              }

              await tx.subscription.create({
                data: {
                  userId: existingOrder.userId,
                  productId: existingOrder.productId,
                  status: "ACTIVE",
                  nextBillingDate,
                },
              });
            }
          }

          return updated;
        }),
      { operationName: "order.updateOrderStatusTransaction" }
    );

    // Dispara notificação por e-mail fora da transação do banco
    if (
      newStatus === "COMPLETED" &&
      previousStatus !== "COMPLETED" &&
      existingOrder.user?.email &&
      existingOrder.product
    ) {
      try {
        await sendOrderConfirmationEmail(
          existingOrder.user.email,
          existingOrder.user.name,
          existingOrder.product.name,
          existingOrder.id
        );
      } catch (emailErr) {
        console.warn("Aviso: falha não-bloqueante ao enviar e-mail de confirmação:", emailErr);
      }
    }

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/produtos");
    revalidatePath("/minha-conta");

    return {
      success: true,
      orderId: updatedOrder.id,
      previousStatus,
      newStatus: updatedOrder.status,
      customerName: existingOrder.user?.name || "Cliente",
      productName: existingOrder.product?.name || "Software",
      updatedAt: updatedOrder.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return {
      success: false,
      error: "Falha ao persistir alteração de status no PostgreSQL. Tente novamente.",
    };
  }
}
