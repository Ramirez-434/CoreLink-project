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
