"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createCoupon(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Acesso negado. Apenas administradores podem criar cupons." };
    }

    const code = formData.get("code") as string;
    const discountType = formData.get("discountType") as string;
    const discountValue = parseFloat(formData.get("discountValue") as string);
    const usageLimitRaw = formData.get("usageLimit") as string;
    
    await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        usageLimit: usageLimitRaw ? parseInt(usageLimitRaw) : null,
      }
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
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Acesso negado. Apenas administradores podem alterar o status de cupons." };
    }

    await prisma.coupon.update({
      where: { id },
      data: { isActive: !currentStatus }
    });
    revalidatePath("/admin/cupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar cupom." };
  }
}

// Para usar na tela de checkout pública
export async function validateCoupon(code: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  
  if (!coupon) return { valid: false, error: "Cupom não encontrado." };
  if (!coupon.isActive) return { valid: false, error: "Cupom inativo." };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { valid: false, error: "Cupom esgotado." };
  if (coupon.expiryDate && coupon.expiryDate < new Date()) return { valid: false, error: "Cupom expirado." };

  return { valid: true, coupon };
}
