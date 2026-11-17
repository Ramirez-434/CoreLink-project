"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession, verifyAuthenticatedUser } from "@/lib/admin-auth";

export async function createCoupon(formData: FormData) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem criar cupons." };
    }

    const code = ((formData.get("code") as string) || "").trim().toUpperCase();
    const discountType = (formData.get("discountType") as string) || "PERCENTAGE";
    const discountValue = parseFloat((formData.get("discountValue") as string) || "");
    const usageLimitRaw = (formData.get("usageLimit") as string) || "";
    const parsedUsageLimit = usageLimitRaw ? parseInt(usageLimitRaw, 10) : null;

    if (!code || !["PERCENTAGE", "FIXED"].includes(discountType)) {
      return { success: false, error: "Código ou tipo de desconto inválido." };
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0 ||
      (discountType === "PERCENTAGE" && discountValue > 100)
    ) {
      return {
        success: false,
        error: "Valor de desconto inválido (deve ser maior que zero e até 100% para percentual).",
      };
    }

    if (parsedUsageLimit !== null && (!Number.isInteger(parsedUsageLimit) || parsedUsageLimit <= 0)) {
      return { success: false, error: "O limite de uso deve ser um número inteiro positivo." };
    }

    await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        usageLimit: parsedUsageLimit,
      },
    });

    revalidatePath("/admin/cupons");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao criar cupom. Talvez o código já exista." };
  }
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem alterar o status de cupons." };
    }

    await prisma.coupon.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/admin/cupons");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar cupom." };
  }
}

// Para usar na tela de checkout autenticada
export async function validateCoupon(code: string) {
  const user = await verifyAuthenticatedUser();
  if (!user) {
    return { valid: false, error: "Faça login para validar cupons." };
  }

  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, error: "Informe um código de cupom válido." };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });

  if (!coupon) return { valid: false, error: "Cupom não encontrado." };
  if (!coupon.isActive) return { valid: false, error: "Cupom inativo." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: "Cupom esgotado." };
  }
  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    return { valid: false, error: "Cupom expirado." };
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
  };
}
