import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface VerifiedSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Revalida no banco de dados PostgreSQL se o usuário da sessão JWT ainda existe
 * e se mantém privilégios ativos de ADMIN (prevenindo uso de JWT órfão ou revogado).
 */
export async function verifyAdminSession(): Promise<VerifiedSessionUser | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return null;
  }

  return dbUser;
}

/**
 * Revalida no banco de dados PostgreSQL se o usuário autenticado ainda existe.
 */
export async function verifyAuthenticatedUser(): Promise<VerifiedSessionUser | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return dbUser ?? null;
}
