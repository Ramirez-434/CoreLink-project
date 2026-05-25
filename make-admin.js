const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "mrbatista@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });
    console.log(`[SUCESSO] Usuário ${email} promovido para ADMIN.`);
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Administrador (MrBatista)",
        email,
        password: hashedPassword,
        role: "ADMIN"
      }
    });
    console.log(`[SUCESSO] Usuário ${email} criado com a senha 'admin123' e privilégios de ADMIN.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
