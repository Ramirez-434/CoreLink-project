import React from "react";

interface SkeletonProps {
  className?: string;
}

/**
 * Componente primitivo de Tela Esquelética (Skeleton Screen)
 * com suporte a Dark Mode e acessibilidade ARIA.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando conteúdo..."
      className={`animate-pulse rounded-xl bg-gray-200/90 dark:bg-gray-700/70 ${className}`}
    />
  );
}

/**
 * Skeleton individual de um Card de Software no Catálogo (/sistemas)
 */
export function CatalogCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="border border-gray-200 dark:border-gray-700/80 rounded-2xl p-8 text-center bg-white dark:bg-gray-800/50 flex flex-col justify-between h-full shadow-sm"
    >
      <div>
        {/* Ícone / Imagem do Software */}
        <Skeleton className="w-24 h-24 rounded-2xl mx-auto mb-6" />

        {/* Badge de Categoria */}
        <Skeleton className="h-4 w-24 rounded-full mx-auto mb-3" />

        {/* Título do Software */}
        <Skeleton className="h-6 w-3/4 mx-auto mb-3 rounded-lg" />

        {/* Linhas de Descrição */}
        <div className="space-y-2 mb-5">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-11/12 mx-auto rounded-md" />
          <Skeleton className="h-3.5 w-4/5 mx-auto rounded-md" />
        </div>

        {/* Preço da Licença */}
        <Skeleton className="h-7 w-32 mx-auto mb-6 rounded-lg" />
      </div>

      {/* Botões de Ação (Saiba Mais + Adicionar ao Carrinho) */}
      <div className="space-y-3">
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid de Skeletons do Catálogo de Softwares (/sistemas)
 */
export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <CatalogCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Skeleton dos 4 Cards Principais de KPI do Dashboard Administrativo
 */
export function DashboardKpiCardsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando indicadores do dashboard..."
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4"
        >
          <Skeleton className="w-14 h-14 rounded-full shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-7 w-36 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton do Módulo de Gráficos Gerenciais e Analytics (UC04)
 */
export function DashboardChartsSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-8 mb-8">
      {/* Barra de Controle de Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-64 rounded-md" />
            <Skeleton className="h-3.5 w-80 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
      </div>

      {/* 4 Mini-Cards de Resumo Analítico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2"
          >
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Grid Principal dos 2 Gráficos Interativos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Evolução do Faturamento Acumulado (7 colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-60 rounded-md" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
            <Skeleton className="h-8 w-36 rounded-xl" />
          </div>
          {/* Área simulando barras e curva de faturamento */}
          <div className="h-72 flex items-end justify-between gap-3 pt-8 px-4 border-b border-l border-gray-200 dark:border-gray-700">
            <Skeleton className="w-full h-24 rounded-t-lg" />
            <Skeleton className="w-full h-36 rounded-t-lg" />
            <Skeleton className="w-full h-32 rounded-t-lg" />
            <Skeleton className="w-full h-48 rounded-t-lg" />
            <Skeleton className="w-full h-56 rounded-t-lg" />
            <Skeleton className="w-full h-64 rounded-t-lg" />
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Licença de Software (5 colunas) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-52 rounded-md" />
              <Skeleton className="h-3.5 w-40 rounded-md" />
            </div>
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>

          {/* Donut Ring Placeholder */}
          <div className="my-4 flex items-center justify-center">
            <div className="w-44 h-44 rounded-full border-[18px] border-gray-200 dark:border-gray-700 animate-pulse flex items-center justify-center">
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>

          {/* Legenda de Licenças */}
          <div className="space-y-2.5 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-3.5 w-32 rounded" />
                </div>
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton da seção inferior do Dashboard (Ranking de Licenças + Tabela de Vendas Recentes)
 */
export function DashboardBottomSkeleton() {
  return (
    <div role="status" aria-busy="true" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Ranking de Licenças */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <Skeleton className="h-6 w-48 mb-6 rounded-md" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="h-4 w-20 rounded ml-auto" />
                <Skeleton className="h-2.5 w-14 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relatório de Vendas Recentes */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <Skeleton className="h-6 w-56 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Completo da Página de Dashboard Administrativo (/admin/dashboard)
 */
export function DashboardFullSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      {/* Banner Header Skeleton */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gray-900/95 p-8 md:p-10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-36 bg-gray-700" />
          <Skeleton className="h-9 w-72 bg-gray-700 rounded-lg" />
          <Skeleton className="h-4 w-96 bg-gray-700 rounded-md" />
        </div>
        <Skeleton className="h-10 w-44 bg-gray-700 rounded-xl" />
      </div>

      <DashboardKpiCardsSkeleton />
      <DashboardChartsSkeleton />
      <DashboardBottomSkeleton />
    </div>
  );
}

/**
 * Skeleton da Tabela de Gestão Dinâmica de Pedidos (/admin/pedidos)
 */
export function OrdersTableSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-48 rounded-xl" />
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-8 w-44 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
