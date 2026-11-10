"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSetting(key: string, defaultValue: string = "false") {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting ? setting.value : defaultValue;
}

export async function toggleSystemSetting(key: string, value: string) {
  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    revalidatePath("/admin/configuracoes");
    revalidatePath("/minha-conta");
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
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: "company_name" },
        update: { value: data.companyName },
        create: { key: "company_name", value: data.companyName },
      }),
      prisma.systemSetting.upsert({
        where: { key: "company_email" },
        update: { value: data.companyEmail },
        create: { key: "company_email", value: data.companyEmail },
      }),
      prisma.systemSetting.upsert({
        where: { key: "company_cnpj" },
        update: { value: data.companyCnpj },
        create: { key: "company_cnpj", value: data.companyCnpj },
      }),
    ]);

    revalidatePath("/admin/configuracoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar dados da empresa:", error);
    return { success: false, error: "Erro interno ao salvar dados da empresa." };
  }
}

export async function clearSystemCache() {
  try {
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
    return { success: false, error: "Falha ao limpar cache do sistema." };
  }
}
