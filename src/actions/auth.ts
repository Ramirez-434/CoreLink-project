"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "./email";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return { error: "E-mail já está em uso." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "USER"
      }
    });

    // Send Welcome Email
    await sendWelcomeEmail(user.email, user.name || "Cliente");

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao criar conta." };
  }
}
