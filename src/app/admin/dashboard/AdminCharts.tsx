"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Layers, CheckCircle2, Clock } from "lucide-react";

export type EvolutionDataPoint = {
  date: string;
  fullDate?: string;
  orders: number;
  completedOrders: number;
  revenue: number;
  cumulativeRevenue: number;
  grossRevenue: number;
  cumulativeGrossRevenue: number;
};

export type LicenseDistributionItem = {
  id: string;
  name: string;
  licensesSold: number;
  totalLicensesRequested: number;
  revenue: number;
  potentialRevenue: number;
  shareRevenue: number;
  shareUnits: number;
};

interface AdminChartsProps {
  data: EvolutionDataPoint[];
  licenseData: LicenseDistributionItem[];
  periodoLabel: string;
}

const COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"];

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function AdminCharts({ data, licenseData, periodoLabel }: AdminChartsProps) {
  // Controles interativos do Gráfico 1 (Evolução do Faturamento Acumulado)
  const [evolutionMode, setEvolutionMode] = useState<"cumulative" | "composed" | "orders">("composed");
  const [includePending, setIncludePending] = useState<boolean>(false);

  // Controles interativos do Gráfico 2 (Distribuição por Licença de Software)
  const [distributionMetric, setDistributionMetric] = useState<"revenue" | "units">("revenue");
  const [distributionChartType, setDistributionChartType] = useState<"donut" | "bars">("donut");

  const activeCumulativeKey = includePending ? "cumulativeGrossRevenue" : "cumulativeRevenue";
  const activePeriodKey = includePending ? "grossRevenue" : "revenue";

  const latestPoint = data && data.length > 0 ? data[data.length - 1] : null;
  const currentCumulativeTotal = latestPoint
    ? includePending
      ? latestPoint.cumulativeGrossRevenue
      : latestPoint.cumulativeRevenue
    : 0;

  // Prepara dados de distribuição conforme os filtros interativos
  const processedLicenseData = (licenseData || [])
    .map((item) => {
      const value =
        distributionMetric === "revenue"
          ? includePending
            ? item.potentialRevenue
            : item.revenue
          : includePending
          ? item.totalLicensesRequested
          : item.licensesSold;
      return {
        ...item,
        activeValue: value,
      };
    })
    .filter((item) => item.activeValue > 0)
    .sort((a, b) => b.activeValue - a.activeValue);

  const totalDistributionValue = processedLicenseData.reduce((acc, cur) => acc + cur.activeValue, 0);

  return (
    <div className="space-y-8 mb-8">
      {/* Barra de Controle Global do Módulo de Analytics (UC04) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Módulo de Gráficos Gerenciais e Analytics
              </h2>
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                UC04 • {periodoLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Acompanhamento interativo da curva de faturamento acumulado e participação por licença de software.
            </p>
          </div>
        </div>

        {/* Seletor de Base de Cálculo: Concluídos vs Pipeline Bruto */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIncludePending(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !includePending
                ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <CheckCircle2 size={14} />
            Faturamento Efetivado
          </button>
          <button
            type="button"
            onClick={() => setIncludePending(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              includePending
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <Clock size={14} />
            Incluir Pendentes (Bruto)
          </button>
        </div>
      </div>

      {/* Grid Principal: Evolução Acumulada + Distribuição por Software */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GRÁFICO 1: Evolução do Faturamento Acumulado (7 colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Evolução do Faturamento Acumulado
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Acumulado no período:{" "}
                  <strong className="text-blue-600 dark:text-blue-400 font-extrabold">
                    {formatBRL(currentCumulativeTotal)}
                  </strong>
                </p>
              </div>

              {/* Botões de modo de visualização */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl self-start">
                <button
                  type="button"
                  onClick={() => setEvolutionMode("composed")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    evolutionMode === "composed"
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Acumulado + Período
                </button>
                <button
                  type="button"
                  onClick={() => setEvolutionMode("cumulative")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    evolutionMode === "cumulative"
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Curva Acumulada
                </button>
                <button
                  type="button"
                  onClick={() => setEvolutionMode("orders")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    evolutionMode === "orders"
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Qtd. Pedidos
                </button>
              </div>
            </div>

            {!data || data.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
                Sem registros para o período selecionado.
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {evolutionMode === "composed" ? (
                    <ComposedChart data={data} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        tickFormatter={(v) => `R$ ${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: any, name: any) => [
                          formatBRL(Number(value ?? 0)),
                          name,
                        ]}
                      />
                      <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                      <Bar
                        dataKey={activePeriodKey}
                        name="Receita no Dia/Mês"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        barSize={28}
                      />
                      <Area
                        type="monotone"
                        dataKey={activeCumulativeKey}
                        name="Faturamento Acumulado"
                        stroke="#2563EB"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCumulative)"
                        dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  ) : evolutionMode === "cumulative" ? (
                    <AreaChart data={data} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCumOnly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        tickFormatter={(v) => `R$ ${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: any) => [
                          formatBRL(Number(value ?? 0)),
                          "Faturamento Acumulado",
                        ]}
                      />
                      <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                      <Area
                        type="monotone"
                        dataKey={activeCumulativeKey}
                        name="Faturamento Acumulado (R$)"
                        stroke="#4F46E5"
                        strokeWidth={3.5}
                        fillOpacity={1}
                        fill="url(#colorCumOnly)"
                        dot={{ r: 4, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                      <Bar
                        dataKey="completedOrders"
                        name="Pedidos Concluídos"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        barSize={28}
                      />
                      <Bar
                        dataKey="orders"
                        name="Total de Pedidos"
                        fill="#2563EB"
                        radius={[6, 6, 0, 0]}
                        barSize={28}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Rodapé informativo do Gráfico 1 */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/70 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Pontos analisados na série:{" "}
              <strong className="text-gray-800 dark:text-gray-200">{data.length}</strong>
            </span>
            <span>
              Base ativa:{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                {includePending ? "Concluídos + Pendentes" : "Apenas Concluídos (COMPLETED)"}
              </strong>
            </span>
          </div>
        </div>

        {/* GRÁFICO 2: Distribuição de Vendas por Licença de Software (5 colunas) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Vendas por Licença de Software
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Distribuição proporcional por produto B2B
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Alternador Receita vs Unidades */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDistributionMetric("revenue")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      distributionMetric === "revenue"
                        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    R$
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistributionMetric("units")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      distributionMetric === "units"
                        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Licenças
                  </button>
                </div>

                {/* Alternador Pizza/Donut vs Barras */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDistributionChartType("donut")}
                    title="Gráfico de Rosca"
                    className={`p-1.5 rounded-lg transition-all ${
                      distributionChartType === "donut"
                        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <PieChartIcon size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistributionChartType("bars")}
                    title="Gráfico de Barras"
                    className={`p-1.5 rounded-lg transition-all ${
                      distributionChartType === "bars"
                        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <BarChart3 size={15} />
                  </button>
                </div>
              </div>
            </div>

            {processedLicenseData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm text-center px-4">
                <Layers size={32} className="mb-2 opacity-40" />
                <p>Nenhuma venda registrada com os filtros atuais.</p>
                {!includePending && (
                  <button
                    type="button"
                    onClick={() => setIncludePending(true)}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold underline"
                  >
                    Visualizar incluindo pedidos pendentes
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {distributionChartType === "donut" ? (
                      <PieChart>
                        <Pie
                          data={processedLicenseData}
                          dataKey="activeValue"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={82}
                          paddingAngle={4}
                        >
                          {processedLicenseData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0 8px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value: any, name: any) => {
                            const num = Number(value ?? 0);
                            const pct =
                              totalDistributionValue > 0
                                ? ((num / totalDistributionValue) * 100).toFixed(1)
                                : "0.0";
                            return [
                              distributionMetric === "revenue"
                                ? `${formatBRL(num)} (${pct}%)`
                                : `${num} licença(s) (${pct}%)`,
                              name,
                            ];
                          }}
                        />
                      </PieChart>
                    ) : (
                      <BarChart
                        data={processedLicenseData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" opacity={0.6} />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          width={110}
                          tick={{ fill: "#6B7280", fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                          }}
                          formatter={(value: any) => [
                            distributionMetric === "revenue"
                              ? formatBRL(Number(value ?? 0))
                              : `${Number(value ?? 0)} licença(s)`,
                            distributionMetric === "revenue" ? "Receita" : "Volume",
                          ]}
                        />
                        <Bar dataKey="activeValue" radius={[0, 6, 6, 0]} barSize={22}>
                          {processedLicenseData.map((_, index) => (
                            <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Lista detalhada de participação por licença */}
                <div className="mt-3 space-y-2.5 max-h-40 overflow-y-auto pr-1">
                  {processedLicenseData.map((item, idx) => {
                    const share =
                      totalDistributionValue > 0
                        ? ((item.activeValue / totalDistributionValue) * 100).toFixed(1)
                        : "0.0";
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-xl"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-gray-500 dark:text-gray-400">
                            {includePending ? item.totalLicensesRequested : item.licensesSold} lic.
                          </span>
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            {formatBRL(includePending ? item.potentialRevenue : item.revenue)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                            {share}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
