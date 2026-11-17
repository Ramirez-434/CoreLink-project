# 6. Segurança Aplicada e Controles Implementados 🛡️

Este documento consolida todos os mecanismos de segurança implementados na plataforma **CoreLink / HJ Infor**, abrangendo a arquitetura defensiva estrutural (RBAC em proxy/rotas, revalidação de sessão no PostgreSQL, sanitização B2B, proteção transacional ACID de checkout e banco Neon PostgreSQL via Prisma), bem como todas as remediações aplicadas após as auditorias de segurança (`run-1` e `run-2`) e os resultados das verificações em produção.

---

## 1. Visão Geral da Arquitetura Defensiva

A segurança da aplicação está organizada em quatro camadas complementares:

1. **Perímetro de Roteamento e Sessão (`src/proxy.ts`, `src/lib/rbac-middleware.ts`, `src/auth.config.ts`, `src/auth.ts`):**
   - Interceptação global via Next.js 16 `proxy` nas rotas `/admin/:path*`, `/minha-conta/:path*` e `/checkout/:path*`.
   - Autenticação com Auth.js / NextAuth (`CredentialsProvider`), estratégia `jwt`, normalização canônica de e-mail (`.trim().toLowerCase()`) e verificação de senha com `bcryptjs` (`bcrypt.compare` em `src/auth.ts` e hash com fator de custo `10` + política server-side de `6` a `72` bytes em `src/actions/auth.ts`).
   - Segredo `NEXTAUTH_SECRET` de **256 bits de entropia** configurado no ambiente local e na Vercel (`Production` e `Preview`), e `DATABASE_URL` com `sslmode=verify-full` e `channel_binding=require`.
2. **Revalidação de Privilégios em Tempo Real no PostgreSQL (`src/lib/admin-auth.ts`, `src/app/admin/layout.tsx`, `src/app/admin/pedidos/export/route.ts`):**
   - Os helpers centralizados `verifyAdminSession()` e `verifyAuthenticatedUser()` consultam diretamente o banco PostgreSQL (`prisma.user.findUnique`) a cada carregamento de `/admin/*` e a cada chamada de Server Action administrativa ou autenticada, garantindo revogação imediata caso uma conta seja rebaixada ou removida.
3. **Server Actions Blindadas (`src/actions/*.ts`) e Sanitização (`src/lib/sanitize.ts`):**
   - Todas as Server Actions expostas exigem sessão autenticada e/ou privilégio `ADMIN` revalidado no banco; módulos internos de e-mail (`src/actions/email.ts`) e pagamento (`src/actions/payment.ts`) não expõem endpoints `"use server"` públicos.
   - Sanitização anti-injeção (`hasMaliciousInjection`, `sanitizeTextInput`), validação algorítmica Módulo 11 de CPF/CNPJ, projeção explícita `select` sem `User.password` em todos os Server Components e transações ACID atômicas em pedidos, estoque e cupons.
4. **Camada de Dados (`prisma/schema.prisma`, `src/lib/prisma.ts`, `src/lib/orderFilters.ts`):**
   - Consultas parametrizadas via Prisma ORM e `pg.Pool` com política de retentativa exponencial (`withDatabaseRetry`). A única query SQL direta do projeto é o ping fixo `SELECT 1 AS alive` sem interpolação de entrada do usuário (`src/lib/prisma.ts`).

---

## 2. Correções de Segurança Implementadas (`run-1` + Hardening Completo `run-2`)

| Área / Controle | Arquivos Modificados | Proteção Implementada |
| :--- | :--- | :--- |
| **Revalidação de Sessão Admin no PostgreSQL** | `src/lib/admin-auth.ts`, `src/app/admin/layout.tsx`, `src/actions/*.ts` | `verifyAdminSession()` valida `session.user.id` e confirma `role === "ADMIN"` em tempo real no PostgreSQL em `AdminLayout` e em todas as Server Actions administrativas (`product.ts`, `coupon.ts`, `settings.ts`, `message.ts`, `order.ts`, `user.ts`). |
| **Proteção contra Auto-Rebaixamento e Allowlist de Roles** | `src/actions/user.ts` | `updateUserRole` valida `role` contra `["ADMIN", "CUSTOMER", "EMPLOYEE"]` e impede que o administrador autenticado remova seu próprio papel `ADMIN`. |
| **Fechamento de Server Actions Públicas Não Autenticadas** | `src/actions/email.ts`, `src/actions/payment.ts`, `src/actions/settings.ts`, `src/actions/coupon.ts` | Remoção de `"use server"` em `email.ts` e `payment.ts` (módulos exclusivamente internos); allowlist de chaves públicas em `getSystemSetting`; exigência de `verifyAuthenticatedUser()` e projeção mínima `{ id, code, discountType, discountValue }` em `validateCoupon`. |
| **Eliminação de Serialização de `User.password` em RSC** | `src/app/admin/clientes/page.tsx`, `src/app/(public)/minha-conta/page.tsx`, `src/app/(public)/minha-conta/perfil/page.tsx`, `src/app/admin/{dashboard,pedidos,assinaturas,clientes/[id]}/page.tsx`, `src/app/admin/pedidos/export/route.ts` | Inclusão de cláusulas `select` explícitas omitindo o hash `password` em todas as consultas Prisma de usuários e relacionamentos `user`. |
| **Transação Atômica em `updateOrderStatus` e Estoque** | `src/actions/order.ts` | Leitura de `existingOrder` e atualização condicional `tx.order.updateMany({ where: { id: orderId, status: previousStatus } })` dentro de `prisma.$transaction`, decremento de estoque condicionado a `stock: { gte: existingOrder.quantity }`, verificação de `product.stock > 0` no checkout e prevenção de duplicidade em `Subscription`. |
| **Idempotência Escopada por Tenant no Checkout** | `src/actions/order.ts`, `src/app/(public)/checkout/[id]/CheckoutForm.tsx` | Chave de idempotência escopada por `${userId}:${productId}:${idempotencyKey}` com limpeza automática de entradas expiradas (`> 60s`). |
| **Vínculo de Remetente e Sanitização `mailto:` no Contato** | `src/actions/contact.ts`, `src/app/admin/mensagens/page.tsx` | `submitContactForm` vincula o envio ao e-mail autenticado verificado no banco (`authUser.email`), aplica `hasMaliciousInjection` e `sanitizeTextInput`, e `/admin/mensagens` renderiza `mailto:${encodeURI(msg.email)}` validado por regex. |
| **CSV Formula Injection (Servidor e Cliente)** | `src/app/admin/pedidos/export/route.ts`, `src/app/admin/clientes/ClientesManager.tsx`, `src/app/admin/produtos/ProdutosManager.tsx` | Prefixo `' ` em células iniciadas por `[=+\-@\t\r]` e escape de aspas duplas `""` em todas as exportações CSV. |
| **HTML Injection & Header Safety em E-mails** | `src/actions/email.ts` | Truncamento `orderId.slice(0, 8).toUpperCase()` antes de `escapeHtml` e remoção de quebras de linha `\r\n`. |
| **Política de Senha Server-Side e Normalização de Login** | `src/actions/auth.ts`, `src/auth.ts` | `registerUser` exige `password.length >= 6` e `Buffer.byteLength(password, "utf8") <= 72` no servidor; `authorize` normaliza `credentials.email` com `.trim().toLowerCase()`. |
| **Redação de Telemetria em `/api/health/db`** | `src/app/api/health/db/route.ts` | Visitantes anônimos recebem apenas `{ status: "HEALTHY", ok: true, timestamp }` (métricas internas do pool ficam restritas a `ADMIN`) e erros `503` não vazam `error.message` bruto do driver. |
| **Remoção de Credenciais Hardcoded em Scripts** | `make-admin.js`, `make-admin.ts`, `scratch/force-password.ts` | Substituição de senhas literais por leitura obrigatória de `process.env.ADMIN_INITIAL_PASSWORD` (mínimo 8 caracteres). |

---

## 3. Verificações Executadas (Qualidade, Tipagem, Build e Banco)

| Verificação | Comando | Resultado |
| :--- | :--- | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **Passou** (`0` erros de compilação e tipos) |
| **ESLint** | `npm run lint` | **Passou** (`0` erros) |
| **Production Build Next.js 16** | `npm run build` | **Passou** (`prisma generate && next build` concluído com sucesso) |
| **Simulações de Segurança** | `node scripts/test-sanitization-vuln1.mjs`, `test-concurrency-vuln2.mjs`, `test-rbac-vuln3.mjs` | **Passaram** (`exit code 0` nos 3 cenários) |
| **Normalização do Banco Neon PostgreSQL** | `User.role` e `SystemSetting` | `11` clientes normalizados como `CUSTOMER`, `1` `ADMIN` e `6` chaves `SystemSetting` ativas |
