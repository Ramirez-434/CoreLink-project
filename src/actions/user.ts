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

import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  // Permite CNPJ/CPF com pontuação (ex: 00.000.000/0000-00 ou 000.000.000-00)
  document: z.string().regex(/^([0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}|[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}|[0-9]{11}|[0-9]{14})$/, "Documento (CPF/CNPJ) inválido").optional().or(z.literal("")),
  stateRegistration: z.string().optional(),
  address: z.string().optional(),
});

export async function updateUserProfile(data: {
  name: string;
  phone: string;
  companyName: string;
  document: string;
  stateRegistration: string;
  address: string;
}) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Não autorizado." };
    }

    const validatedData = profileSchema.safeParse(data);
    
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.errors[0].message };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.data.name,
        phone: validatedData.data.phone,
        companyName: validatedData.data.companyName,
        document: validatedData.data.document || null,
        stateRegistration: validatedData.data.stateRegistration || null,
        address: validatedData.data.address,
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
