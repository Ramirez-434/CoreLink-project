import type { Prisma } from "@prisma/client";

export type OrderFilters = {
  q?: string;
  status?: string;
  periodo?: string; // "7" | "30" | "all"
};

export function periodStart(periodo?: string): Date | undefined {
  const days = periodo === "7" ? 7 : periodo === "30" ? 30 : 0;
  if (!days) return undefined;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function buildOrdersWhere({ q, status, periodo }: OrderFilters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (status && ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].includes(status)) {
    if (status === "PENDING" || status === "PROCESSING") {
      where.status = { in: ["PENDING", "PROCESSING"] };
    } else {
      where.status = status;
    }
  }

  const start = periodStart(periodo);
  if (start) where.createdAt = { gte: start };

  const term = q?.trim();
  if (term) {
    where.OR = [
      { id: { startsWith: term.toLowerCase() } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { product: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  return where;
}
