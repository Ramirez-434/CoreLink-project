"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function deleteMessage(formData: FormData) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem excluir mensagens." };
    }

    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID inválido" };

    await prisma.contactMessage.delete({
      where: { id },
    });

    revalidatePath("/admin/mensagens");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao excluir mensagem." };
  }
}
