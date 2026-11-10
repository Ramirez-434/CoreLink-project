import { prisma } from "@/lib/prisma";

import { ClientesManager } from "./ClientesManager";

export default async function ClientesPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  const typedUsers = users.map((u) => ({
    ...u,
    role: u.role as "ADMIN" | "CUSTOMER" | "EMPLOYEE",
  }));

  return <ClientesManager initialUsers={typedUsers} />;
}
