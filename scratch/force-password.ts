import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "mrbatista@gmail.com";
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      role: "ADMIN"
    },
    create: {
      name: "Administrador (MrBatista)",
      email,
      password: hashedPassword,
      role: "ADMIN"
    }
  });
  console.log(`[SUCESSO] Senha de ${email} redefinida para 'admin123'.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
