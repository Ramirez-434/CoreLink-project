# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Clientes Corporativos (PMEs Brasileiras):** Proprietários, gestores operacionais e responsáveis administrativos/TI de pequenas e médias empresas no Brasil que buscam contratar sistemas de gestão (estoque, financeiro, faturamento e vendas) da **HJ Infor**, parametrizar os dados fiscais da empresa (CNPJ/CPF, Razão Social e Inscrição Estadual) para emissão de Nota Fiscal Eletrônica (NF-e) e acompanhar a ativação de licenças com suporte direto via WhatsApp Comercial.
- **Equipe Interna e Administradores (HJ Infor):** Administradores e equipe comercial/pós-venda que gerenciam o catálogo de softwares, cupons, pedidos, clientes, mensagens de contato e acionam clientes no pós-venda pelo painel `/admin`.

## Product Purpose

**CoreLink** é a plataforma oficial de e-commerce B2B, autoatendimento cadastral e ativação de licenças dos sistemas empresariais desenvolvidos pela **HJ Infor**. Seu objetivo é permitir que PMEs descubram as soluções de software da empresa, criem sua conta corporativa sem atrito, registrem pedidos de licenciamento ou assinatura, mantenham seu cadastro fiscal apto para faturamento (NF-e) e iniciem a implantação assistida diretamente com a equipe comercial.

O sucesso do produto significa reduzir o tempo entre o cadastro inicial e a entrada do software em produção no cliente, garantindo dados fiscais íntegros (validados pelo padrão Módulo 11 da Receita Federal) e comunicação contextualizada no pós-venda.

## Positioning

Diferente de marketplaces genéricos de software (que entregam apenas um link de download sem acompanhamento) ou de consultorias tradicionais (que exigem longas negociações antes de exibir preços e escopo), o **CoreLink (HJ Infor)** combina **transparência de catálogo e contratação self-service** com **implantação assistida via WhatsApp Comercial parametrizado** — enviando automaticamente ID do pedido, Razão Social, CNPJ, Inscrição Estadual e lista de licenças contratadas para ativação imediata junto à equipe técnica da HJ Infor.

## Operating Context

- **Descoberta e Contratação Self-Service:** Clientes avaliam sistemas no catálogo público (`/sistemas` e `/produto/[id]`), adicionam licenças ao carrinho (`/carrinho`), aplicam cupons promocionais e registram o pedido no checkout (`/checkout`).
- **Onboarding em Duas Etapas (Progressive Disclosure):** O cadastro inicial (`/cadastro`) exige apenas os dados essenciais do responsável e consentimento LGPD para liberar o painel imediatamente (`/minha-conta?welcome=true`), enquanto o enriquecimento fiscal completo para emissão de NF-e (Razão Social, CNPJ/CPF com validação Módulo 11, Inscrição Estadual ou Isento e Endereço com busca por CEP) é guiado pelo checklist interativo no painel (`/minha-conta/perfil`).
- **Pós-Venda e Implantação no WhatsApp Comercial:** Tanto o painel do cliente (`/minha-conta`) quanto o painel administrativo (`/admin/pedidos`) operam integrados a links estruturados do WhatsApp (`src/lib/whatsapp.ts`), garantindo que nenhum atendimento comece sem o contexto fiscal e técnico do pedido.
- **Operação Multi-Dispositivo e Impressão:** Utilizado tanto em computadores de escritório quanto em celulares (via WhatsApp no dia a dia do gestor de PME), além de suportar impressão limpa do resumo de licenças contratadas.

## Capabilities and Constraints

- **Stack e Infraestrutura Existentes:** Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma ORM com PostgreSQL (Neon) e autenticação via NextAuth v5 (`ADMIN`, `EMPLOYEE`, `CUSTOMER`).
- **Modelo Comercial Confirmado:** Registro de pedido no site seguido de ativação, faturamento e implantação assistida via WhatsApp Comercial (sem gateway de cobrança automática com bloqueio antes do contato comercial).
- **Conformidade Fiscal e Legal Brasileira:**
  - Validação algorítmica de CPF e CNPJ (Módulo 11 da Receita Federal) e suporte explícito a empresas isentas de Inscrição Estadual (`ISENTO`).
  - Conformidade com a LGPD (Lei nº 13.709/2018), incluindo aceite expresso no cadastro, solicitação de portabilidade/exportação de dados e protocolo de encerramento de conta com ressalva de guarda fiscal obrigatória.
- **Terminologia do Domínio:** *Sistemas*, *Licenças*, *Implantação Assistida*, *Dados Fiscais (NF-e)*, *Razão Social*, *Inscrição Estadual (IE)*, *Painel Corporativo*.

## Brand Commitments

- **Marca:** **HJ Infor** (empresa desenvolvedora e operadora comercial) e **CoreLink** (plataforma e catálogo de soluções empresariais).
- **Tom de Voz:** Corporativo, claro, prestativo e direto em português brasileiro (`pt-BR`), transmitindo segurança técnica e proximidade no suporte sem jargões desnecessários.

## Evidence on Hand

- **Ativos Visuais Localizados em `public/images/`:** Ilustrações e fotografias institucionais e de produto (`tech-software.jpg`, `tech-product.jpg`, `tech-team.jpg`, `tech-security.jpg`, `card-seguranca.jpg`, `card-velocidade.jpg`, `card-suporte.jpg`, `card-facil.jpg`).
- **Documentação Técnica Interna em `docs/`:** Guias de arquitetura, rotas, banco de dados, autenticação e fluxo de vendas (`docs/1-visao-geral.md` a `docs/5-fluxo-e-design.md`).
- **Ausências Confirmadas (Não Fabricar):** Não inventar depoimentos de clientes reais, logotipos de empresas parceiras, certificações externas não verificadas ou métricas de SLA que não constem no banco de dados ou na documentação oficial.

## Product Principles

1. **Acesso Imediato, Burocracia Fiscal no Momento Certo:** Nunca bloquear a criação de conta com formulários fiscais extensos; liberar o painel em menos de um minuto e guiar o preenchimento de CNPJ, Razão Social e IE com progresso claro antes do faturamento.
2. **Atendimento Sempre Contextualizado:** Toda transição entre o painel web e o WhatsApp Comercial deve carregar automaticamente a identificação da empresa, CNPJ, número do pedido e softwares selecionados, poupando o cliente de repetir informações.
3. **Integridade Cadastral Antes da Nota Fiscal:** Validar documentos (CPF/CNPJ Módulo 11), sanitizar entradas contra injeções e preservar rascunhos não salvos para evitar retrabalho operacional no faturamento.
4. **Autonomia com Suporte Humano Acessível:** O cliente deve conseguir explorar sistemas, simular quantidades de licenças e revisar seus pedidos sozinho, mas sempre ter um atalho direto e visível para falar com um consultor da HJ Infor.

## Accessibility & Inclusion

- Interface 100% em português do Brasil (`lang="pt-BR"`), com suporte a tema claro e escuro (`next-themes`), respeito à preferência de redução de movimento (`prefers-reduced-motion: reduce`), navegação completa por teclado (`:focus-visible`, *focus trap* em diálogos) e alvos de toque mínimos de 44×44px (WCAG 2.5.5) para uso em dispositivos móveis.

