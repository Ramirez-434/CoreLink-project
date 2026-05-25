"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateUserRole(id: string, role: "ADMIN" | "CUSTOMER") {
  try {
    await prisma.user.update({
      where: { id },
      data: { role }
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao atualizar permissão." };
  }
}

export async function updateUserProfile(data: {
  name: string;
  phone: string;
  companyName: string;
  document: string;
  address: string;
}) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Não autorizado." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
        companyName: data.companyName,
        document: data.document,
        address: data.address,
      },
    });

    revalidatePath("/minha-conta");
    revalidatePath("/minha-conta/perfil");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error: "Erro interno ao salvar os dados." };
  }
}
