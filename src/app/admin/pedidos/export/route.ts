import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { buildOrdersWhere } from "@/lib/orderFilters";

/**
 * Escapa células CSV e neutraliza CSV Formula Injection (OWASP)
 * prefixando caracteres executáveis (=, +, -, @, tab, CR) com apóstrofo.
 */
function csvCell(value: string | number) {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await auth();

  // 1. Verificação de Autenticação (401 Unauthorized)
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        code: "AUTH_REQUIRED_401",
        error: "Não autenticado. Faça login com uma conta administrativa.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }

  // 2. Verificação Estrita de Papel na Sessão JWT (403 Forbidden)
  if ((session.user as any).role !== "ADMIN") {
    console.warn(
      `[SECURITY][Export CSV Bloqueado] Tentativa de bypass por userId=${session.user.id} (role=${(session.user as any).role})`
    );
    return NextResponse.json(
      {
        success: false,
        code: "RBAC_FORBIDDEN_403",
        error: "Acesso negado (403 Forbidden). Apenas administradores podem exportar relatórios CSV.",
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }

  // 3. Revalidação do Papel Diretamente no PostgreSQL (Previne Bypass via Token JWT Expirado/Revogado)
  const dbAdminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });

  if (!dbAdminUser || dbAdminUser.role !== "ADMIN") {
    console.warn(
      `[SECURITY][Revoked JWT Bypass Bloqueado] userId=${session.user.id} não possui role ADMIN ativa no PostgreSQL.`
    );
    return NextResponse.json(
      {
        success: false,
        code: "RBAC_DB_REVOKED_403",
        error: "Privilégio administrativo revogado ou inexistente no banco de dados.",
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const where = buildOrdersWhere({
    q: searchParams.get("q") || undefined,
    status: searchParams.get("status") || undefined,
    periodo: searchParams.get("periodo") || undefined,
  });

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true, coupon: true },
  });

  const statusLabel: Record<string, string> = {
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
    PENDING: "Pendente",
    PROCESSING: "Processando",
  };

  const header = [
    "ID",
    "Data",
    "Cliente",
    "Razão Social",
    "CNPJ/CPF",
    "E-mail",
    "Produto",
    "Qtd",
    "Cupom",
    "Status",
    "Valor (R$)",
  ];
  const rows = orders.map((o) => [
    o.id,
    o.createdAt.toLocaleString("pt-BR"),
    o.user?.name ?? "",
    o.user?.companyName ?? "",
    o.user?.document ?? "",
    o.user?.email ?? "",
    o.product?.name ?? "",
    o.quantity,
    o.coupon?.code ?? "",
    statusLabel[o.status] ?? o.status,
    (o.totalAmount ?? o.product?.price ?? 0).toFixed(2).replace(".", ","),
  ]);

  // BOM para o Excel reconhecer acentos + separador ";" (padrão pt-BR)
  const csv =
    "\uFEFF" +
    [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-RBAC-Verified": "ADMIN-DB",
    },
  });
}
