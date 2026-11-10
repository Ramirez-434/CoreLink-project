"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";
import {
  hasMaliciousInjection,
  sanitizeTextInput,
  validateAndSanitizeDocument,
  sanitizeAndFormatPhone,
  sanitizeStateRegistration,
} from "@/lib/sanitize";

export async function updateUserRole(id: string, role: "ADMIN" | "CUSTOMER") {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Acesso negado. Apenas administradores podem alterar permissões." };
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao atualizar permissão." };
  }
}

const profileSchema = z.object({
  name: z
    .string()
    .transform((v) => sanitizeTextInput(v, 100))
    .refine((v) => v.length >= 2, "O Nome Completo deve ter pelo menos 2 caracteres válidos."),
  phone: z.string().optional().default(""),
  companyName: z
    .string()
    .optional()
    .default("")
    .transform((v) => sanitizeTextInput(v, 120)),
  document: z.string().optional().default(""),
  stateRegistration: z.string().optional().default(""),
  address: z
    .string()
    .optional()
    .default("")
    .transform((v) => sanitizeTextInput(v, 200)),
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

    // 1. Inspeção de segurança contra Input Injection (XSS, HTML Tags, SQLi, Parameter Injection)
    const rawFields = [
      { label: "Nome Completo", value: data.name },
      { label: "Telefone", value: data.phone },
      { label: "Razão Social / Empresa", value: data.companyName },
      { label: "CNPJ/CPF", value: data.document },
      { label: "Inscrição Estadual", value: data.stateRegistration },
      { label: "Endereço", value: data.address },
    ];

    for (const field of rawFields) {
      if (hasMaliciousInjection(field.value)) {
        console.warn(
          `[SECURITY][Input Injection Bloqueado] Campo "${field.label}" rejeitado para userId=${session.user.id}`
        );
        return {
          success: false,
          error: `Bloqueio de Segurança: o campo "${field.label}" contém caracteres ou instruções proibidas.`,
        };
      }
    }

    // 2. Validação e Sanitização Estrita de CNPJ / CPF (Filtro Numérico + Dígitos Verificadores Módulo 11)
    const docCheck = validateAndSanitizeDocument(data.document);
    if (!docCheck.valid) {
      return {
        success: false,
        error: docCheck.error || "Documento (CPF/CNPJ) inválido.",
      };
    }

    // 3. Validação e Formatação Canônica de Telefone Corporativo
    const phoneCheck = sanitizeAndFormatPhone(data.phone);
    if (!phoneCheck.valid) {
      return {
        success: false,
        error: phoneCheck.error || "Telefone inválido.",
      };
    }

    // 4. Validação e Sanitização de Inscrição Estadual
    const ieCheck = sanitizeStateRegistration(data.stateRegistration);
    if (!ieCheck.valid) {
      return {
        success: false,
        error: ieCheck.error || "Inscrição Estadual inválida.",
      };
    }

    // 5. Sanitização dos campos textuais via Schema Zod
    const validatedData = profileSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.data.name,
        phone: phoneCheck.formatted || null,
        companyName: validatedData.data.companyName || null,
        document: docCheck.formatted,
        stateRegistration: ieCheck.formatted,
        address: validatedData.data.address || null,
      },
    });

    revalidatePath("/minha-conta");
    revalidatePath("/minha-conta/perfil");
    revalidatePath("/admin/clientes");
    revalidatePath("/admin/pedidos");

    return {
      success: true,
      sanitized: {
        name: validatedData.data.name,
        companyName: validatedData.data.companyName,
        document: docCheck.formatted || "",
        documentType: docCheck.type,
        phone: phoneCheck.formatted,
        stateRegistration: ieCheck.formatted || "",
        address: validatedData.data.address,
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error: "Erro interno ao salvar os dados." };
  }
}
