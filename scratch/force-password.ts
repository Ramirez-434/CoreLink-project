import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.ADMIN_INITIAL_EMAIL || "mrbatista@gmail.com";
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initialPassword || initialPassword.length < 8) {
    throw new Error(
      "Defina a variável de ambiente ADMIN_INITIAL_PASSWORD (mínimo 8 caracteres) antes de executar este script."
    );
  }

  const hashedPassword = await bcrypt.hash(initialPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Administrador (MrBatista)",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`[SUCESSO] Senha de ${email} redefinida via ADMIN_INITIAL_PASSWORD.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
