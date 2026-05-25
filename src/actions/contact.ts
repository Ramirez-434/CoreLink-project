"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function submitContactForm(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Você precisa ter uma conta e estar logado para enviar mensagens." };
    }
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !subject || !message) {
      return { success: false, error: "Todos os campos são obrigatórios." };
    }

    await prisma.contactMessage.create({
      data: {
        name,
        email,
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
