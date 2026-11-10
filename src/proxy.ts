import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { evaluateAdminRbacMiddleware } from "./lib/rbac-middleware";

const { auth } = NextAuth(authConfig);

/**
 * Proxy / Middleware Global de Segurança e Verificação Estrita de Papéis (RBAC — Next.js 16)
 * Intercepta todas as requisições para /admin/:path* (incluindo /admin/pedidos/export),
 * /minha-conta/:path* e /checkout/:path* antes da execução de Pages ou Route Handlers.
 */
export const proxy = auth((req) => {
  const user = req.auth?.user as
    | { id?: string; email?: string | null; name?: string | null; role?: string }
    | undefined;

  const rbacDecision = evaluateAdminRbacMiddleware(req, user);
  if (rbacDecision) {
    return rbacDecision;
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/minha-conta/:path*", "/checkout/:path*"],
};
