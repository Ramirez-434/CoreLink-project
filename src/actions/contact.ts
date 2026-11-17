"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasMaliciousInjection, sanitizeTextInput } from "@/lib/sanitize";

export async function submitContactForm(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Você precisa ter uma conta e estar logado para enviar mensagens." };
    }
    const rawName = (formData.get("name") as string) || "";
    const rawEmail = ((formData.get("email") as string) || "").trim().toLowerCase();
    const rawSubject = (formData.get("subject") as string) || "";
    const rawMessage = (formData.get("message") as string) || "";

    if (!rawName || !rawEmail || !rawSubject || !rawMessage) {
      return { success: false, error: "Todos os campos são obrigatórios." };
    }

    if (hasMaliciousInjection(rawName) || hasMaliciousInjection(rawEmail) || hasMaliciousInjection(rawSubject) || hasMaliciousInjection(rawMessage)) {
      return { success: false, error: "Entrada bloqueada: caracteres ou instruções proibidas detectadas." };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(rawEmail)) {
      return { success: false, error: "Informe um endereço de e-mail corporativo válido." };
    }

    const name = sanitizeTextInput(rawName, 100);
    const subject = sanitizeTextInput(rawSubject, 150);
    const message = sanitizeTextInput(rawMessage, 2000);

    await prisma.contactMessage.create({
      data: {
        name,
        email: rawEmail,
        subject,
        message,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Contact Form Error:", error);
    return { success: false, error: "Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde." };
  }
}
