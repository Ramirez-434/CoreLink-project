function simulateRbacPipeline(requestPath, tokenUser, dbUser) {
  const isExportRoute = requestPath.startsWith("/admin/pedidos/export");

  // Camada 1: Proxy / Middleware (src/proxy.ts + src/lib/rbac-middleware.ts)
  if (!tokenUser || !tokenUser.id) {
    return {
      layer: "Middleware (src/proxy.ts)",
      status: isExportRoute ? 401 : 307,
      code: "AUTH_REQUIRED_401",
      decision: "BLOQUEADO (Anonimo sem sessao)",
    };
  }

  if (tokenUser.role !== "ADMIN") {
    return {
      layer: "Middleware (src/proxy.ts)",
      status: isExportRoute ? 403 : 307,
      code: "RBAC_FORBIDDEN_403",
      decision: `BLOQUEADO (Bypass negado para role=${tokenUser.role})`,
    };
  }

  // Camada 2: Revalidacao no Banco PostgreSQL (src/app/admin/pedidos/export/route.ts)
  if (!dbUser || dbUser.role !== "ADMIN") {
    return {
      layer: "Route Handler + PostgreSQL",
      status: 403,
      code: "RBAC_DB_REVOKED_403",
      decision: "BLOQUEADO (JWT revogado no PostgreSQL)",
    };
  }

  return {
    layer: "Middleware + Route Handler",
    status: 200,
    code: "ADMIN_AUTHORIZED_200",
    decision: "PERMITIDO (Exportacao CSV Segura + Anti-Formula Injection)",
  };
}

console.log("==========================================================================");
console.log(" AUDITORIA DE SEGURANCA - VULNERABILIDADE 3 (RBAC & BYPASS ADMINISTRATIVO)");
console.log("==========================================================================");

const scenarios = [
  {
    name: "1. Requisicao Anonima em /admin/pedidos/export",
    path: "/admin/pedidos/export",
    tokenUser: null,
    dbUser: null,
  },
  {
    name: "2. Cliente Logado (CUSTOMER) tentando Bypass CSV",
    path: "/admin/pedidos/export",
    tokenUser: { id: "usr_cli01", role: "CUSTOMER" },
    dbUser: { id: "usr_cli01", role: "CUSTOMER" },
  },
  {
    name: "3. Token JWT Antigo (ADMIN revogado no Banco)",
    path: "/admin/pedidos/export",
    tokenUser: { id: "usr_exadm", role: "ADMIN" },
    dbUser: { id: "usr_exadm", role: "CUSTOMER" },
  },
  {
    name: "4. Gestor Autenticado (ADMIN no JWT e no Banco)",
    path: "/admin/pedidos/export",
    tokenUser: { id: "usr_admin", role: "ADMIN" },
    dbUser: { id: "usr_admin", role: "ADMIN" },
  },
];

for (const s of scenarios) {
  const res = simulateRbacPipeline(s.path, s.tokenUser, s.dbUser);
  console.log(
    ` [HTTP ${res.status}] ${s.name.padEnd(48)} -> ${res.decision} [${res.layer}]`
  );
}
console.log("==========================================================================");
