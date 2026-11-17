# 6. Segurança Aplicada e Controles Implementados 🛡️

Este documento consolida todos os mecanismos de segurança implementados na plataforma **CoreLink / HJ Infor**, abrangendo tanto a arquitetura defensiva estrutural (RBAC em proxy/rotas, sanitização B2B, proteção transacional de checkout e PostgreSQL via Prisma) quanto as remediações aplicadas nas últimas ações após a auditoria de segurança (`run-1`) e os resultados das verificações executadas em código.

---

## 1. Visão Geral da Arquitetura Defensiva

A segurança da aplicação está organizada em camadas complementares:

1. **Perímetro de Roteamento e Sessão (`src/proxy.ts`, `src/lib/rbac-middleware.ts`, `src/auth.config.ts`, `src/auth.ts`):**
   - Interceptação global via Next.js 16 `proxy` nas rotas `/admin/:path*`, `/minha-conta/:path*` e `/checkout/:path*`.
   - Autenticação com Auth.js / NextAuth (`CredentialsProvider`), estratégia `jwt` e verificação de senha com `bcryptjs` (`bcrypt.compare` em `src/auth.ts:25` e hash com fator de custo `10` em `src/actions/auth.ts:50`).
   - Segredo `NEXTAUTH_SECRET` rotacionado no `.env` local para chave base64 de **44 caracteres / 32 bytes decodificados (256 bits de entropia)** e `DATABASE_URL` configurada com `sslmode=verify-full` e `channel_binding=require`.
2. **Layouts, RSC e Route Handlers (`src/app/admin/layout.tsx`, `src/app/admin/pedidos/export/route.ts`):**
   - Bloqueio de acesso administrativo no layout e revalidação direta no banco PostgreSQL na rota de exportação CSV de pedidos.
3. **Server Actions (`src/actions/*.ts`) e Sanitização (`src/lib/sanitize.ts`):**
   - Verificação de sessão e papel `ADMIN` nas ações administrativas, sanitização anti-injeção e validação algorítmica Módulo 11 de documentos fiscais, transações ACID e locks contra condições de corrida no checkout.
4. **Camada de Dados (`prisma/schema.prisma`, `src/lib/prisma.ts`, `src/lib/orderFilters.ts`):**
   - Consultas parametrizadas via Prisma ORM e `pg.Pool` com política de retentativa exponencial (`withDatabaseRetry`). A única query SQL direta do projeto é o ping fixo `SELECT 1 AS alive` sem interpolação de entrada do usuário (`src/lib/prisma.ts:147`).

---

## 2. Correções de Segurança Implementadas nas Últimas Ações (Pós-Auditoria `run-1`)

As alterações abaixo foram aplicadas no working tree após os achados confirmados na primeira auditoria (`run-1`):

| Área / Achado (`run-1`) | Arquivos Modificados | Controle Implementado | Referência no Código |
| :--- | :--- | :--- | :--- |
| **Controle de Acesso em Produtos** (`corelink-ac-product-server-actions`) | `src/actions/product.ts` | `createProduct`, `updateProduct` e `deleteProduct` passaram a executar `await auth()` e exigir `session?.user && (session.user as any).role === "ADMIN"` antes de processar `FormData` ou acessar o Prisma. | `src/actions/product.ts:9-12, 65-68, 123-126` |
| **Controle de Acesso em Cupons** (`corelink-ac-coupon-server-actions`) | `src/actions/coupon.ts` | `createCoupon` e `toggleCouponStatus` passaram a validar sessão autenticada com `role === "ADMIN"` antes de criar ou alternar o estado de cupons. | `src/actions/coupon.ts:9-12, 38-41` |
| **Controle de Acesso em Configurações** (`corelink-ac-settings-server-actions`) | `src/actions/settings.ts` | `toggleSystemSetting`, `saveCompanySettings` e `clearSystemCache` passaram a exigir sessão `ADMIN` antes de gravar em `prisma.systemSetting` ou executar `revalidatePath`. | `src/actions/settings.ts:14-17, 40-43, 73-76` |
| **Controle de Acesso na Exclusão de Mensagens** (`corelink-ac-message-deletion`) | `src/actions/message.ts` | `deleteMessage` (acionada também pelo wrapper inline `removeMessage` na tela admin) passou a exigir sessão `ADMIN` antes de executar `prisma.contactMessage.delete`. | `src/actions/message.ts:9-12` e `src/app/admin/mensagens/page.tsx:10-13` |
| **Stored XSS em `mailto:` e Sanitização do Contato** (`corelink-inj-mailto-xss`) | `src/actions/contact.ts`, `src/app/admin/mensagens/page.tsx` | `submitContactForm` passou a normalizar e-mail (`.trim().toLowerCase()`), bloquear padrões maliciosos via `hasMaliciousInjection` nos 4 campos, validar `rawEmail` com regex (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`) e sanitizar `name` (100), `subject` (150) e `message` (2000) com `sanitizeTextInput`. No painel `/admin/mensagens`, o link `mailto:` só é renderizado se `msg.email` corresponder a `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` e passa por `encodeURIComponent(msg.email)`; caso contrário é exibido apenas como `<span>` sem link. | `src/actions/contact.ts:13-33` e `src/app/admin/mensagens/page.tsx:45-51` |
| **CSV Formula Injection no Cliente** (`corelink-inj-client-csv-formula`) | `src/app/admin/clientes/ClientesManager.tsx`, `src/app/admin/produtos/ProdutosManager.tsx` | Inclusão da função `safeCsvCell` em ambos os geradores de CSV no navegador (`clientes.csv` e `produtos.csv`): valores iniciados por `[=+\-@\t\r]` recebem apóstrofo inicial (`'`), aspas duplas são escapadas (`""`) e cabeçalhos e células são delimitados entre aspas. | `ClientesManager.tsx:17-23, 35-45` e `ProdutosManager.tsx:22-28, 100-108` |
| **HTML Injection em E-mails Transacionais** (`corelink-inj-email-html`) | `src/actions/email.ts` | Criação de `escapeHtml` escapando `&`, `<`, `>`, `"` e `'` para `userName`, `productName` e `orderId` (`safeUserName`, `safeProductName`, `safeOrderId`) antes da interpolação nos templates HTML do Resend em `sendOrderConfirmationEmail` e `sendWelcomeEmail`. | `src/actions/email.ts:5-13, 21-48, 65-82` |
| **Entropia da Chave JWT** (`corelink-crypto-jwt-secret`) | `.env` *(não versionado)* | Substituição do segredo estático anterior por `NEXTAUTH_SECRET` em base64 de **44 caracteres / 32 bytes (256 bits)**. | `.env` |

> **Observação sobre o 10º arquivo no working tree:** `src/app/(public)/page.tsx` também possui diff local, mas corresponde apenas à adição de classes utilitárias Tailwind `text-pretty` em 4 parágrafos de interface (ajuste visual, sem relação com controles de segurança).

---

## 3. Controles Estruturais por Camada da Aplicação

Além das correções recentes acima, a base de código implementa os seguintes controles estruturais:

### 3.1. Proxy RBAC e Proteção de Rotas (`src/proxy.ts` e `src/lib/rbac-middleware.ts`)
- **Área de Clientes (`/minha-conta/*` e `/checkout/*`):** qualquer acesso sem `user.id` válido é redirecionado para `/login?callbackUrl=<pathname>` (`src/lib/rbac-middleware.ts:24-31`).
- **Área Administrativa (`/admin/*`):**
  - Requisições sem sessão autenticada recebem HTTP `401 Unauthorized` em JSON (`AUTH_REQUIRED_401`) com cabeçalhos `Cache-Control: no-store, no-cache, must-revalidate`, `X-Content-Type-Options: nosniff` e `X-RBAC-Decision: DENY_UNAUTHENTICATED` quando direcionadas a `/admin/pedidos/export` ou `/api/admin*`, ou redirecionamento para `/login` nas demais rotas (`src/lib/rbac-middleware.ts:36-63`).
  - Requisições autenticadas sem `role === "ADMIN"` recebem HTTP `403 Forbidden` em JSON (`RBAC_FORBIDDEN_403` / `DENY_INSUFFICIENT_ROLE`) em rotas de exportação/API, ou redirecionamento para `/minha-conta?erro=acesso-restrito-admin` (`src/lib/rbac-middleware.ts:66-96`).
  - Admins aprovados recebem cabeçalhos de auditoria `x-rbac-verified: ADMIN` e `x-admin-uid` (`src/lib/rbac-middleware.ts:99-102`).
- **Admin Layout (`src/app/admin/layout.tsx:10-15`):** executa `await auth()` e redireciona para `/` se `!session?.user` ou `role !== "ADMIN"`.

### 3.2. Exportação CSV de Pedidos com Tripla Validação (`src/app/admin/pedidos/export/route.ts`)
O Route Handler `GET /admin/pedidos/export` executa três barreiras consecutivas antes de consultar ou retornar dados sensíveis de clientes (CPF/CNPJ, e-mail, pedidos):
1. **Autenticação JWT (`401 AUTH_REQUIRED_401`):** verifica `session?.user?.id` (`lines 19-37`).
2. **Papel na Sessão (`403 RBAC_FORBIDDEN_403`):** exige `(session.user as any).role === "ADMIN"` (`lines 40-58`).
3. **Revalidação Direta no PostgreSQL (`403 RBAC_DB_REVOKED_403`):** consulta `prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, role: true } })` e bloqueia imediatamente se o usuário não existir ou não possuir `role === "ADMIN"` ativo no banco (`lines 61-84`).
4. **Sanitização e Cabeçalhos da Resposta:** aplica filtros parametrizados via `buildOrdersWhere` (`src/lib/orderFilters.ts:15-40`), escapa células contra fórmulas CSV via `csvCell` (`lines 10-16`), gera CSV UTF-8 com BOM (`\uFEFF`) delimitado por `;` e retorna `Cache-Control: no-store, no-cache, must-revalidate`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` e `X-RBAC-Verified: ADMIN-DB` (`lines 138-147`).

### 3.3. Sanitização B2B, Anti-Injeção e Módulo 11 (`src/lib/sanitize.ts`, `src/actions/user.ts`, `src/actions/auth.ts`)
- **`hasMaliciousInjection` (`src/lib/sanitize.ts:6-27`):** detecta `<script>`, tags HTML (`</?[a-z]...>`), esquemas `javascript:`, `vbscript:`, `data:text/html`, atributos `on*=`, instruções SQL combinadas (`SELECT/INSERT/UPDATE/DELETE/DROP/UNION/ALTER/EXEC/TRUNCATE` seguidas de `FROM/INTO/TABLE/ALL/SET`), comentários SQL (`--`, `/*`, `*/`, `;--`) e caracteres de controle ASCII (`\x00-\x08`, `\x0B`, `\x0C`, `\x0E-\x1F`, `\x7F`).
- **`sanitizeTextInput` (`src/lib/sanitize.ts:33-48`):** remove padrões maliciosos e metacaracteres `< > ; \` \ { }`, colapsa espaços e limita o comprimento (`slice(0, maxLength)`).
- **Validação Algorítmica Fiscal (`src/lib/sanitize.ts:61-308`):**
  - `isValidCPF` e `isValidCNPJ` verificam os dois dígitos verificadores pelo algoritmo **Módulo 11** e rejeitam sequências repetidas (`000...` até `999...`).
  - `validateAndSanitizeDocument` bloqueia qualquer letra ou metacaractere (`/[a-zA-Z<>;'"`\\]/`) e exige exatamente 11 ou 14 dígitos (ou campo vazio).
  - `sanitizeAndFormatPhone` valida DDD + 8 ou 9 dígitos no formato `(XX) XXXXX-XXXX`.
  - `sanitizeStateRegistration` permite apenas `"ISENTO"`/`"ISENTA"` ou `7` a `14` dígitos numéricos.
- **Atualização de Perfil B2B (`src/actions/user.ts:35-145`):** `updateUserProfile` autentica por `session.user.id`, aplica `hasMaliciousInjection` nos 6 campos, valida documento, telefone e IE, aplica `profileSchema` (`zod`) e persiste estritamente com `where: { id: session.user.id }` (impedindo IDOR sobre outro usuário).
- **Cadastro de Conta (`src/actions/auth.ts:13-70`):** `registerUser` normaliza e-mail (`.trim().toLowerCase()`), bloqueia injeções em nome/e-mail/telefone, valida telefone e força `role: "CUSTOMER"` no servidor (ignorando qualquer tentativa de envio de `role` privilegiado pelo cliente).

### 3.4. Integridade Transacional e Anticoncorrência no Checkout (`src/actions/order.ts` e `CheckoutForm.tsx`)
- **Trava no Cliente (`src/app/(public)/checkout/[id]/CheckoutForm.tsx:47-54, 102-120`):** bloqueia duplos cliques síncronos com `checkoutLockRef` + `isLoading` + `createdOrderId` + `couponLockRef` e envia `idempotencyKeyRef` estável por tentativa.
- **Pipeline no Servidor (`src/actions/order.ts:32-194`):**
  1. **Autenticação e Recálculo Server-Side:** exige `session?.user?.id` e busca `product.price` diretamente no PostgreSQL, ignorando valores de preço enviados pelo navegador.
  2. **Cache de Idempotência (`60_000 ms`):** verifica `processedIdempotencyKeys` antes de iniciar nova operação.
  3. **Mutex In-Flight (`activeCheckoutLocks`):** usa chave composta `${userId}:${productId}` para coalescer requisições simultâneas no mesmo milissegundo em uma única execução.
  4. **Deduplicação no Banco (`15_000 ms`):** verifica pedido `PENDING` recente para o mesmo `userId` e `productId` antes de criar outro registro.
  5. **Transação ACID + Cupom Atômico:** dentro de `prisma.$transaction` (com `withDatabaseRetry`), valida atividade/expiração/limite do cupom e executa `tx.coupon.updateMany` condicionado a `isActive: true` e `usedCount: { lt: coupon.usageLimit }`. Se `updated.count === 0`, lança `COUPON_INVALID` e aborta a transação, impedindo que requisições concorrentes excedam o limite de uso do cupom.

### 3.5. Construção Segura de Links e Renderização Pública
- **WhatsApp Comercial (`src/lib/whatsapp.ts:32-145`):** os URLs são fixados em `https://api.whatsapp.com/send`, telefones passam por `.replace(/\D/g, "")` e textos por `encodeURIComponent`; na camada `buildCommercialWhatsAppUrl` campos corporativos também passam por `sanitizeTextInput` e `formatCpfCnpjMask`. Nas páginas de checkout e minha conta os links usam `rel="noopener noreferrer"`.
- **Página de Produto (`src/app/(public)/produto/[id]/page.tsx:111`):** renderiza descrições com `ReactMarkdown` padrão (sem `rehype-raw`, convertendo HTML bruto em texto).
- **Checkout (`src/app/(public)/checkout/[id]/page.tsx:16-24`):** projeta explicitamente apenas `{ name, companyName, document, stateRegistration }` ao buscar o usuário para `CheckoutForm`.

---

## 4. Verificações Executadas e Resultados Atuais

Verificações rodadas diretamente no ambiente local em **17/11/2026**:

| Verificação | Comando | Resultado Observado | Escopo e Limitações |
| :--- | :--- | :--- | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **Passou** (`exit code 0`, 0 erros de tipo) | Compilação estática completa do projeto. |
| **ESLint** | `npm run lint` | **Falhou** (`exit code 1`: `80` problemas — `53` erros, `27` avisos) | Inclui erros `@typescript-eslint/no-explicit-any` (ex.: `(session.user as any).role` nas actions/Navbar e `prisma.ts`), `@typescript-eslint/no-require-imports` em `make-admin.js`, `@typescript-eslint/ban-ts-comment` em `next.config.ts` e regras React 19 (`react-hooks/set-state-in-effect` e `Date.now()` impuro). |
| **Simulação Anti-Injection & Mod-11** | `node scripts/test-sanitization-vuln1.mjs` | **Passou** (`exit code 0`) | Script offline isolado: 2 payloads SQLi/XSS bloqueados, 2 docs inválidos rejeitados, 2 CPF/CNPJ válidos mascarados. Não importa `src/` nem acessa banco. |
| **Simulação Concorrência Checkout** | `node scripts/test-concurrency-vuln2.mjs` | **Passou** (`exit code 0`) | Script offline isolado: `4/4` cliques bloqueados na camada UI simulada e `1` transação aberta para `3` POSTs paralelos (`2` coalescidas). |
| **Simulação Pipeline RBAC** | `node scripts/test-rbac-vuln3.mjs` | **Passou** (`exit code 0`) | Script offline isolado: validou respostas simuladas `401` (anônimo), `403` (`CUSTOMER`), `403` (JWT admin revogado no banco) e `200` (`ADMIN` válido). |
| **Reauditoria de Segurança (`run-2`)** | Fluxo `security-audit` (`Wave 1`) | **Parcial (`in_progress`)** | Ledger da Wave 1 consolidado e validado com `PASS: 21 coverage units valid` (`12 covered`, `9 candidate`). Todas as 8 correções do `run-1` foram confirmadas no código-fonte. As fases finais (segundo critic após reinício do servidor e Fases 3–6 de validação independente de candidatos) não foram concluídas. |

> **Nota sobre execução ao vivo:** Nenhuma rota HTTP, build `next build` ou mutação contra o Neon PostgreSQL foi executada durante estas auditorias por política de isolamento do ambiente local.

---

## 5. Pontos de Atenção e Melhorias Pendentes (Observados no Código e na Wave 1 de `run-2`)

Os itens abaixo correspondem a fragilidades ainda presentes no código-fonte atual (levantados durante a análise estática da Wave 1 de `run-2` e pendentes de validação formal / correção):

1. **Revalidação e Revogação de JWT Stateless (`src/auth.config.ts`, `src/lib/rbac-middleware.ts`, `src/app/admin/layout.tsx`, `src/actions/*.ts`, `src/actions/user.ts`):**
   - Somente `GET /admin/pedidos/export` revalida `User.role` no PostgreSQL. Proxy, `AdminLayout` e Server Actions (`product.ts`, `coupon.ts`, `settings.ts`, `message.ts`, `order.ts`, `user.ts`) confiam apenas na claim `role` do cookie JWT. Se um administrador for rebaixado via `updateUserRole` (inclusive pelo próprio usuário, sem trava de auto-rebaixamento) ou após `signOut`, o cookie JWT anterior permanece aceito enquanto estiver dentro da validade.
   - `make-admin.js`, `make-admin.ts` e `scratch/force-password.ts` mantêm credencial administrativa padrão em código rastreado.
2. **Server Actions `"use server"` Expostas sem Autenticação ou sem Controle Completo:**
   - `src/actions/email.ts`: declara `"use server"` no topo e exporta `sendOrderConfirmationEmail` e `sendWelcomeEmail` sem `auth()`, além de aplicar `escapeHtml(orderId)` antes de `.slice(0, 8)` no `subject`.
   - `src/actions/settings.ts#getSystemSetting`: exportada em módulo `"use server"` sem `auth()` ou allowlist de chaves permitidas.
   - `src/actions/coupon.ts#validateCoupon`: acessível sem `auth()`, retorna o objeto completo `coupon` do Prisma e testa `if (coupon.usageLimit && ...)` (onde `usageLimit === 0` seria tratado diferente de `!= null` em `createOrder`).
   - `src/actions/payment.ts`: declara `"use server"` e exporta os stubs `createPaymentIntent` e `handleWebhook` sem autenticação (atualmente apenas registram log e retornam mock sem tocar o banco).
3. **Máquina de Estados e Estoque em `updateOrderStatus` (`src/actions/order.ts:210-267`):**
   - `existingOrder` é lido fora de `prisma.$transaction`, e `tx.order.update` não aplica pré-condição atômica de `status: previousStatus` nem checagem `stock >= quantity`, permitindo corrida ou nova transição `COMPLETED` -> `CANCELLED` -> `COMPLETED` com decrementos repetidos de estoque e criação duplicada de `Subscription`.
4. **Escopo do Cache de Idempotência no Checkout (`src/actions/order.ts:25, 47-56, 92, 165`):**
   - `processedIdempotencyKeys` usa apenas `idempotencyKey` como chave no `Map` global (sem compor com `userId`, diferentemente de `activeCheckoutLocks`) e não remove chaves expiradas após 60s. Além disso, `createOrder` verifica `product.isAvailable`, mas não verifica `product.stock > 0`.
5. **Projeção Prisma em Server Components (`src/app/admin/clientes/page.tsx:6-15`, `src/app/(public)/minha-conta/page.tsx:39-41,173`, `src/app/(public)/minha-conta/perfil/page.tsx:15-17,48`):**
   - Consultas `findMany`/`findUnique` sem cláusula `select` passam o objeto `User` completo (incluindo o hash `password`) como prop para Client Components (`ClientesManager`, `ProfileProgressBar`, `ProfileForm`).
6. **Telemetria Pública em `/api/health/db` (`src/app/api/health/db/route.ts`):**
   - Endpoint não exige autenticação e retorna métricas de pool (`totalCount`, `idleCount`, `waitingCount`, latência) no `200` e `error?.message` bruto no `503`.
7. **Identidade do Remetente e Política de Senha:**
   - `submitContactForm` (`src/actions/contact.ts`) exige usuário logado, mas aceita `name` e `email` arbitrários do `FormData` sem vincular `session.user.id` ou exigir correspondência com `session.user.email`.
   - `registerUser` (`src/actions/auth.ts`) checa `!password` no servidor; a regra mínima de 6 caracteres (`password.length >= 6`) é validada apenas no cliente (`src/app/(public)/cadastro/page.tsx:31`), e `authorize` (`src/auth.ts:20`) busca `credentials.email` sem `.trim().toLowerCase()`.
8. **Configuração de Ambiente, Layout e Endurecimento Cliente:**
   - `src/app/layout.tsx:50` inclui `<script src="http://localhost:8400/live.js?token=...">` sem guarda `NODE_ENV === "development"`, e não há `Content-Security-Policy` explícita em `next.config.ts` ou `src/proxy.ts`.
   - `.env` define `NEXTAUTH_URL` apontando para túnel ngrok e `AUTH_TRUST_HOST="true"`; `next.config.ts:6,10` lista o domínio ngrok e `localhost:3000` em `allowedDevOrigins` e `serverActions.allowedOrigins`.
   - `ClientesManager.tsx` e `ProdutosManager.tsx` podem reforçar o regex CSV para espaços/quebras de linha iniciais e liberar `URL.revokeObjectURL(url)` após o download; `dashboard/page.tsx` interpola `sp.periodo` no link de exportação sem validar o conjunto `7` | `30` | `all`; `LgpdPrivacySection.tsx` possui botões de solicitação apenas em estado local sem rota de backend.
