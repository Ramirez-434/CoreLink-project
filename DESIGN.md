---
name: CoreLink (HJ Infor)
description: Plataforma B2B para contratação de softwares e gestão de licenças empresariais
colors:
  primary: "#2563EB"
  primary-hover: "#1D4ED8"
  secondary: "#0F172A"
  background: "#FAFAFA"
  foreground: "#171717"
  surface-dark: "#111827"
  surface-dark-card: "#1F2937"
  border-light: "#E5E7EB"
  border-dark: "#374151"
  text-muted: "#6B7280"
  emerald-accent: "#059669"
  amber-accent: "#D97706"
typography:
  display:
    fontFamily: "var(--font-inter), sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "var(--font-inter), sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-inter), sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-inter), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "var(--font-inter), sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: CoreLink (HJ Infor)

## Overview

**Creative North Star: "O Hub Tecnológico Confiável"**

O CoreLink adota uma linguagem visual sólida, moderna e acessível, projetada para transmitir autoridade e transparência a proprietários e gestores de pequenas e médias empresas (PMEs) brasileiras. A interface combina a energia do azul royal tecnológico (`#2563EB`) com a sobriedade do slate escuro (`#0F172A`), criando um ambiente corporativo limpo tanto no modo claro quanto no modo escuro.

A hierarquia visual é focada em clareza operacional: o cliente identifica imediatamente o status de suas licenças, os requisitos fiscais pendentes para emissão de nota fiscal (NF-e) e os atalhos de implantação via WhatsApp. Não há ornamentos vazios, jargões técnicos complexos ou distrações visuais — cada cartão, botão e distintivo tem propósito prático e mensurável.

**Key Characteristics:**
- **Clareza Corporativa:** Tipografia Inter em pesos contrastantes (extrabold para títulos de seções, regular/medium para textos instrucionais e tabular-nums para dados numéricos e monetários).
- **Feedback Tátil Imediato:** Botões e cartões com cantos arredondados amigáveis (`12px` a `16px`), anéis de foco bem definidos e transição sutil de elevação (`hover-lift`) em ponteiros precisos.
- **Disfarce Zero de Estado:** Pílulas de status cromáticas (esmeralda para ativo, âmbar para em implantação/pendente e vermelho para cancelado) com ícones semânticos explícitos.

## Colors

A paleta é centrada no azul royal tecnológico como cor primária de ação, ancorada por tons neutros equilibrados para os modos claro e escuro, complementada por esmeralda para ativação/WhatsApp e âmbar para atenção cadastral.

### Primary
- **Azul Royal Tecnológico** (`#2563EB` / hover `#1D4ED8`): Identidade principal de marca, botões de ação primária (CTA), barras de progresso ativas e links de destaque.

### Secondary
- **Slate Corporativo** (`#0F172A`): Títulos de alto impacto, cabeçalhos de cartões escuros e elementos de contraste profundo.

### Neutral
- **Fundo Claro** (`#FAFAFA`): Fundo padrão da aplicação em modo claro.
- **Fundo Escuro** (`#111827`): Fundo padrão em modo escuro (Tailwind gray-900).
- **Superfície de Cartão Escura** (`#1F2937`): Cartões e modais no modo escuro (Tailwind gray-800).
- **Texto Principal** (`#171717` claro / `#F3F4F6` escuro): Leitura de alta legibilidade.
- **Texto Secundário / Labels** (`#4B5563` claro / `#9CA3AF` escuro): Metadados, IDs de pedidos e descrições contextuais.
- **Bordas Estruturais** (`#E5E7EB` claro / `#374151` escuro): Divisores de seção e contornos de cartões.

### Semantic
- **Esmeralda Ativação / WhatsApp** (`#059669` / fundo `#ECFDF5`): Status "Ativo", confirmações LGPD, checkout bem-sucedido e integrações comerciais do WhatsApp.
- **Âmbar Atenção Fiscal** (`#D97706` / fundo `#FFFBEB`): Status "Em Implantação", campos fiscais pendentes no checklist e alertas de pré-salvamento.
- **Vermelho Alerta** (`#DC2626` / fundo `#FEF2F2`): Mensagens de erro de validação (Módulo 11), status "Cancelado" e diálogo de exclusão LGPD.

### Named Rules
**A Regra da Ação Primária Única.** Cada viewport deve conter no máximo um botão primário com fundo azul royal preenchido (`#2563EB`). Ações secundárias devem usar estilo tonal, outline ou link de texto com alvo de toque protegido.

## Typography

**Display Font:** Inter (`var(--font-inter), sans-serif`)  
**Body Font:** Inter (`var(--font-inter), sans-serif`)  
**Mono Font:** Monospace nativo com `tabular-nums`

A tipografia é coesa e orientada à legibilidade operacional, utilizando a escala Inter com tracking negativo sutil nos títulos grandes e alinhamento mono-espaçado para CNPJ, CPF, telefones e valores em Reais (R$).

### Hierarchy
- **Display** (800, `2.5rem`–`3rem`, 1.15): Título principal da Home e cabeçalhos de apresentação institucional.
- **Headline** (800, `1.75rem`–`2rem`, 1.25): Títulos de páginas autenticadas ("Minha Conta Corporativa", "Cadastro Corporativo e Fiscal").
- **Title** (700, `1.125rem`–`1.25rem`, 1.35): Títulos de cartões de software, títulos de passos do tour e subtítulos de seções.
- **Body** (400/500, `0.875rem` / `14px`, 1.5): Parágrafos informativos, instruções de formulário e orientações de onboarding.
- **Label** (600/700, `0.75rem` / `12px`, 1.35): Badges de status, percentuais de progresso, prazos de contratação e avisos de campo obrigatório.

### Named Rules
**A Regra dos Números Tabulares.** Todos os valores monetários (`currency: BRL`), identificadores de pedido (`#00000000`), documentos fiscais e porcentagens numéricas devem renderizar com `tabular-nums` para garantir alinhamento tabular vertical e prevenir oscilações visuais durante cálculos dinâmicos.

## Layout

O layout do CoreLink é desenhado com abordagem **mobile-first**, estruturado em container centralizado (`max-w-5xl` no painel do cliente e catálogo, `max-w-3xl` em formulários de perfil e checkout):
- **Margens e Espaçamento:** `px-4` no mobile escalando para `px-6` ou `px-8` no desktop; ritmo vertical baseado na escala de 8px (gaps de `16px` a `32px`).
- **Refluxo Adaptativo:** Grids de licenças e produtos em 1 coluna no mobile (`< 768px`) e 2 a 3 colunas no desktop (`md:grid-cols-2`, `lg:grid-cols-3`).
- **Alvos de Toque:** Todo elemento interativo (links, botões, checkboxes e seletores) possui altura mínima de `44px` (WCAG 2.5.5) no mobile.

## Elevation & Depth

O CoreLink opera sob o princípio **Tonal Layered + Lifted**. A profundidade em repouso é transmitida principalmente por contraste de superfícies tonais e bordas sutis (`border border-gray-200 dark:border-gray-800`), e não por sombras escuras artificiais.

### Shadow Vocabulary
- **Sombra Repouso Cartão** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05)`): Cartões de software e contêineres padrão em repouso.
- **Sombra Elevação Ativa (Hover-Lift)** (`box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.15), 0 8px 10px -6px rgba(37, 99, 235, 0.1)`): Aplicada exclusivamente em dispositivos com ponteiro preciso (`@media (hover: hover) and (pointer: fine)`) em cartões clicáveis e botões interativos ao pairar o mouse, acompanhada de `translateY(-4px)`.
- **Sombra Flutuante (Tour & Diálogos)** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): Popovers de onboarding, modais de confirmação e bottom sheets mobile.

### Named Rules
**A Regra da Elevação Condicionada.** Elementos de tela não devem levitar em repouso. Sombras estruturais pronunciadas só aparecem como resposta direta ao estado do usuário (hover, foco do teclado, popover ativo).

## Shapes

O vocabulário de formas é geométrico e suave:
- **`rounded-xl` (12px):** Inputs de formulário, botões secundários, caixas de checklist e pequenos contêineres de alerta.
- **`rounded-2xl` (16px):** Cartões de software, blocos de onboarding, popovers de diálogo e seções agrupadas.
- **`rounded-3xl` (24px):** Contêineres de autenticação (Login e Cadastro), heros e modais de alto impacto.
- **`rounded-full` (9999px):** Pílulas de status, badges numéricos, barras de progresso e botões de chamada no hero.

## Components

### Buttons
- **Shape:** `rounded-xl` (12px) por padrão; `rounded-full` apenas em CTAs do hero da Home.
- **Primary:** Fundo `#2563EB`, texto branco, tipografia bold 14px, altura mínima de `44px` a `48px`. Hover escurece para `#1D4ED8`.
- **Secondary / Ghost:** Fundo tonal claro (`bg-blue-50 dark:bg-gray-800`) ou transparente com borda (`border-gray-300 dark:border-gray-700`), hover suave e texto com contraste adequado.
- **Ações Destrutivas / Confirmações Críticas:** Diálogos usam botão seguro ("Cancelar e manter conta") em destaque neutro e botão de confirmação em vermelho corporativo (`#DC2626`).

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px).
- **Background:** Branco puro (`#FFFFFF`) em modo claro; cinza profundo (`#111827`) ou ardósia (`#1F2937`) em modo escuro.
- **Borda:** 1px sólido (`border-gray-200/80 dark:border-gray-800`).
- **Internal Padding:** `p-6` a `p-8`.

### Inputs / Fields
- **Shape:** `rounded-xl` (12px), padding `12px 16px`.
- **Tipografia:** 14px no desktop; `16px` no mobile (`max-width: 640px`) para impedir zoom automático involuntário no iOS Safari.
- **Estados:** Borda padrão cinza; borda primária `#2563EB` com anel de foco `ring-2 focus:ring-primary/50`; borda vermelha `#EF4444` apenas após o campo ser modificado e perder o foco (`onBlur`).

### Tour & Onboarding
- **Desktop:** Popover flutuante posicionado dinamicamente acima ou abaixo do elemento destacado com anel de holofote (`spotlight`).
- **Mobile (< 640px / landscape < 520px):** Transforma-se em *bottom sheet* fixo na zona do polegar com indicador visual superior (*handle*), rolagem interna e suporte a gesto de deslize lateral (swipe).

## Do's and Don'ts

### Do:
- **Do** manter todos os alvos de clique e toque com pelo menos `44px` de altura (`min-h-[44px]`).
- **Do** formatar valores monetários, percentuais e identificadores de pedido com `tabular-nums`.
- **Do** validar documentos cadastrais (CNPJ/CPF) pelo algoritmo oficial Módulo 11 da Receita Federal antes de enviar ao servidor.
- **Do** preservar a integridade do modo escuro (`dark:bg-gray-900`, `dark:text-white`, `dark:border-gray-800`) em todas as novas superfícies.
- **Do** fornecer feedback imediato por `toast` (Sonner) após ações concluídas ou descartadas.

### Don't:
- **Don't** exibir mensagens de erro inline de validação antes do usuário terminar de digitar e sair do campo (`onBlur`).
- **Don't** utilizar texto com gradiente colorido ou kickers/eyebrows decorativos redundantes sobre cabeçalhos formais.
- **Don't** bloquear o acesso ao painel do cliente exigindo dados fiscais completos logo no primeiro cadastro.
- **Don't** utilizar animações contínuas ou transições de escala agressivas quando o usuário solicitar redução de movimento (`prefers-reduced-motion: reduce`).
- **Don't** criar links de WhatsApp sem parametrizar o número do pedido, razão social e lista de sistemas contratados.
