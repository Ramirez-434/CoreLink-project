import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_INITIAL_EMAIL || "mrbatista@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    console.log(`[SUCESSO] Usuário ${email} promovido para ADMIN.`);
  } else {
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (!initialPassword || initialPassword.length < 8) {
      throw new Error(
        "Defina a variável de ambiente ADMIN_INITIAL_PASSWORD (mínimo 8 caracteres) para criar o usuário administrador inicial."
      );
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    await prisma.user.create({
      data: {
        name: "Administrador (MrBatista)",
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log(`[SUCESSO] Usuário ${email} criado com privilégios de ADMIN.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
