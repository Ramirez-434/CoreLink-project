import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface AuthenticatedSessionUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
}

/**
 * Avalia estritamente o Controle de Acesso Baseado em Papéis (RBAC) na camada de Middleware / Proxy
 * para mitigar a Vulnerabilidade 3 (Bypassing Administrativo em /admin e /admin/pedidos/export).
 */
export function evaluateAdminRbacMiddleware(
  req: NextRequest,
  user: AuthenticatedSessionUser | null | undefined
): NextResponse | null {
  const { pathname } = req.nextUrl;
  const isExportOrApiRoute =
    pathname.startsWith("/admin/pedidos/export") || pathname.startsWith("/api/admin");

  // 1. Proteção de rotas autenticadas de clientes (/minha-conta e /checkout)
  if (pathname.startsWith("/minha-conta") || pathname.startsWith("/checkout")) {
    if (!user || !user.id) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return null;
  }

  // 2. Proteção estrita RBAC para todo o perímetro /admin/* (incluindo /admin/pedidos/export)
  if (pathname.startsWith("/admin")) {
    // Caso A: Tentativa de acesso anônimo (sem sessão válida) -> 401 Unauthorized ou Redirect /login
    if (!user || !user.id) {
      console.warn(
        `[SECURITY][RBAC Middleware] Bloqueio 401 (Anônimo) na rota administrativa: ${pathname}`
      );

      if (isExportOrApiRoute) {
        return NextResponse.json(
          {
            success: false,
            code: "AUTH_REQUIRED_401",
            error: "Não autenticado. Credenciais administrativas válidas são exigidas para acessar este recurso.",
            path: pathname,
          },
          {
            status: 401,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
              "X-Content-Type-Options": "nosniff",
              "X-RBAC-Decision": "DENY_UNAUTHENTICATED",
            },
          }
        );
      }

      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Caso B: Usuário logado com papel inferior (ex.: CUSTOMER / USER) tentando Bypass Administrativo -> 403 Forbidden
    if (user.role !== "ADMIN") {
      console.warn(
        `[SECURITY][RBAC Bypass Bloqueado] Usuário id=${user.id} (role=${user.role || "NONE"}) tentou acessar rota restrita: ${pathname}`
      );

      if (isExportOrApiRoute) {
        return NextResponse.json(
          {
            success: false,
            code: "RBAC_FORBIDDEN_403",
            error:
              "Acesso negado (403 Forbidden). Seu perfil não possui privilégio ADMINISTRADOR (ADMIN) para exportar relatórios.",
            requiredRole: "ADMIN",
            currentRole: user.role || "CUSTOMER",
            path: pathname,
          },
          {
            status: 403,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
              "X-Content-Type-Options": "nosniff",
              "X-RBAC-Decision": "DENY_INSUFFICIENT_ROLE",
            },
          }
        );
      }

      const forbiddenRedirect = new URL("/minha-conta", req.nextUrl.origin);
      forbiddenRedirect.searchParams.set("erro", "acesso-restrito-admin");
      return NextResponse.redirect(forbiddenRedirect);
    }

    // Caso C: Administrador autenticado (role === "ADMIN") -> Autorizado com cabeçalho de auditoria
    const response = NextResponse.next();
    response.headers.set("x-rbac-verified", "ADMIN");
    response.headers.set("x-admin-uid", user.id);
    return response;
  }

  return null;
}
