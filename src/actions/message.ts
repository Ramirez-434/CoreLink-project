"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function deleteMessage(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Acesso negado. Apenas administradores podem excluir mensagens." };
    }

    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID inválido" };

    await prisma.contactMessage.delete({
      where: { id }
    });

    revalidatePath("/admin/mensagens");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao excluir mensagem." };
  }
}
