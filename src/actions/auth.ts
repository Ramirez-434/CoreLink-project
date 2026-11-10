"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "./email";
import {
  hasMaliciousInjection,
  sanitizeTextInput,
  sanitizeAndFormatPhone,
} from "@/lib/sanitize";

export async function registerUser(formData: FormData) {
  const rawName = (formData.get("name") as string) || "";
  const rawEmail = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = (formData.get("password") as string) || "";
  const rawPhone = (formData.get("phone") as string) || "";

  if (!rawName || !rawEmail || !password) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  if (hasMaliciousInjection(rawName) || hasMaliciousInjection(rawEmail) || hasMaliciousInjection(rawPhone)) {
    return { error: "Entrada bloqueada: caracteres inválidos ou tentativa de injeção detectada." };
  }

  const name = sanitizeTextInput(rawName, 100);
  if (name.length < 2) {
    return { error: "Informe um nome válido com pelo menos 2 caracteres." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(rawEmail)) {
    return { error: "Formato de e-mail inválido." };
  }

  const phoneCheck = sanitizeAndFormatPhone(rawPhone);
  if (!phoneCheck.valid) {
    return { error: phoneCheck.error || "Telefone inválido." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: rawEmail },
  });

  if (existingUser) {
    return { error: "E-mail já está em uso." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email: rawEmail,
        phone: phoneCheck.formatted || null,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    await sendWelcomeEmail(user.email, user.name || "Cliente");

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao criar conta." };
  }
}
