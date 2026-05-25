"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrder(productId: string, couponId?: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Você precisa estar logado para fazer um pedido." };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isAvailable) {
      return { success: false, error: "Produto indisponível." };
    }

    let totalAmount = product.price;
    let appliedCoupon = null;

    if (couponId) {
      appliedCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (appliedCoupon && appliedCoupon.isActive) {
        if (appliedCoupon.discountType === "PERCENTAGE") {
          totalAmount = totalAmount - (totalAmount * (appliedCoupon.discountValue / 100));
        } else {
          totalAmount = totalAmount - appliedCoupon.discountValue;
        }
        if (totalAmount < 0) totalAmount = 0;

        await prisma.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

    await prisma.order.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        status: "PENDING",
        totalAmount,
        couponId: appliedCoupon ? appliedCoupon.id : null
      }
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/minha-conta");
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao processar pedido." };
  }
}
