import { prisma } from "@/lib/prisma";

import { ClientesManager } from "./ClientesManager";

export default async function ClientesPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <ClientesManager initialUsers={users} />;
}
