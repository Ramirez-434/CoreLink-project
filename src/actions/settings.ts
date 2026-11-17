"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/admin-auth";

const PUBLIC_SETTING_KEYS = new Set([
  "company_name",
  "company_email",
  "company_cnpj",
  "maintenance_mode",
  "onboarding_tour_enabled",
  "email_notifications",
]);

export async function getSystemSetting(key: string, defaultValue: string = "false") {
  try {
    if (!PUBLIC_SETTING_KEYS.has(key)) {
      const admin = await verifyAdminSession();
      if (!admin) {
        return defaultValue;
      }
    }

    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error("Erro ao consultar configuração do sistema:", error);
    return defaultValue;
  }
}

export async function toggleSystemSetting(key: string, value: string) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem alterar configurações." };
    }

    if (!PUBLIC_SETTING_KEYS.has(key)) {
      return { success: false, error: "Chave de configuração inválida." };
    }

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    revalidatePath("/admin/configuracoes");
    revalidatePath("/minha-conta");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar configuração:", error);
    return { success: false, error: "Erro interno ao salvar." };
  }
}

export async function saveCompanySettings(data: {
  companyName: string;
  companyEmail: string;
  companyCnpj: string;
}) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem salvar dados da empresa." };
    }

    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: "company_name" },
        update: { value: data.companyName.trim() },
        create: { key: "company_name", value: data.companyName.trim() },
      }),
      prisma.systemSetting.upsert({
        where: { key: "company_email" },
        update: { value: data.companyEmail.trim() },
        create: { key: "company_email", value: data.companyEmail.trim() },
      }),
      prisma.systemSetting.upsert({
        where: { key: "company_cnpj" },
        update: { value: data.companyCnpj.trim() },
        create: { key: "company_cnpj", value: data.companyCnpj.trim() },
      }),
    ]);

    revalidatePath("/admin/configuracoes");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar dados da empresa:", error);
    return { success: false, error: "Erro interno ao salvar dados da empresa." };
  }
}

export async function clearSystemCache() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem limpar o cache." };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
    return { success: false, error: "Falha ao limpar cache do sistema." };
  }
}
