"use server";

import { prisma } from "@/lib/prisma";
import { verifyAuthenticatedUser } from "@/lib/admin-auth";
import { hasMaliciousInjection, sanitizeTextInput } from "@/lib/sanitize";

export async function submitContactForm(formData: FormData) {
  try {
    const authUser = await verifyAuthenticatedUser();
    if (!authUser) {
      return {
        success: false,
        error: "Você precisa ter uma conta e estar logado para enviar mensagens.",
      };
    }

    const rawName = (formData.get("name") as string) || authUser.name || "";
    const rawEmail = ((formData.get("email") as string) || authUser.email || "")
      .trim()
      .toLowerCase();
    const rawSubject = (formData.get("subject") as string) || "";
    const rawMessage = (formData.get("message") as string) || "";

    if (!rawName || !rawEmail || !rawSubject || !rawMessage) {
      return { success: false, error: "Todos os campos são obrigatórios." };
    }

    if (
      hasMaliciousInjection(rawName) ||
      hasMaliciousInjection(rawEmail) ||
      hasMaliciousInjection(rawSubject) ||
      hasMaliciousInjection(rawMessage)
    ) {
      return {
        success: false,
        error: "Entrada bloqueada: caracteres ou instruções proibidas detectadas.",
      };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(rawEmail)) {
      return { success: false, error: "Informe um endereço de e-mail corporativo válido." };
    }

    const verifiedAccountEmail = authUser.email.trim().toLowerCase();
    const name = sanitizeTextInput(rawName, 100);
    const subject = sanitizeTextInput(rawSubject, 150);
    const messageBody =
      rawEmail !== verifiedAccountEmail
        ? `[Conta autenticada: ${verifiedAccountEmail} | E-mail informado: ${rawEmail}]\n${rawMessage}`
        : rawMessage;
    const message = sanitizeTextInput(messageBody, 2000);

    await prisma.contactMessage.create({
      data: {
        name,
        email: verifiedAccountEmail,
        subject,
        message,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Contact Form Error:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.",
    };
  }
}
