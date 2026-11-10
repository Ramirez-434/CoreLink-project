import { Suspense } from "react";
import { TrendingUp, Users, ShoppingBag, DollarSign, Award, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminCharts, EvolutionDataPoint, LicenseDistributionItem } from "./AdminCharts";
import { PeriodFilter } from "@/components/admin/PeriodFilter";
import { periodStart } from "@/lib/orderFilters";
import {
  DashboardKpiCardsSkeleton,
  DashboardChartsSkeleton,
  DashboardBottomSkeleton,
} from "@/components/ui/Skeleton";

async function DashboardDataStream({ periodo }: { periodo: string }) {
  const start = periodStart(periodo);
  const periodWhere = start ? { createdAt: { gte: start } } : {};

  const periodoLabel =
    periodo === "7"
      ? "Últimos 7 dias"
      : periodo === "30"
      ? "Últimos 30 dias"
      : "Todo o Período";

  // Consultas assíncronas em paralelo enquanto os Skeleton Screens são exibidos
  const [ordersCount, customersCount, recentOrders, periodOrders] = await Promise.all([
    prisma.order.count({ where: periodWhere }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      where: periodWhere,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        product: true,
      },
    }),
    prisma.order.findMany({
      where: periodWhere,
      orderBy: { createdAt: "asc" },
      include: { product: true },
    }),
  ]);

  const completedOrders = periodOrders.filter((o) => o.status === "COMPLETED");

  const totalRevenue = completedOrders.reduce(
    (acc, order) => acc + (order.totalAmount ?? (order.product?.price || 0)),
    0
  );
  const ticketMedio = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Distribuição de Vendas por Licença de Software (UC04)
  const licenseMap = new Map<
    string,
    {
      id: string;
      name: string;
      licensesSold: number;
      totalLicensesRequested: number;
      revenue: number;
      potentialRevenue: number;
    }
  >();

  periodOrders.forEach((order) => {
    if (!order.product || order.status === "CANCELLED") return;
    const pid = order.product.id;
    const qty = order.quantity || 1;
    const val = order.totalAmount ?? order.product.price ?? 0;

    if (!licenseMap.has(pid)) {
      licenseMap.set(pid, {
        id: pid,
        name: order.product.name,
        licensesSold: 0,
        totalLicensesRequested: 0,
        revenue: 0,
        potentialRevenue: 0,
      });
    }

    const entry = licenseMap.get(pid)!;
    entry.totalLicensesRequested += qty;
    entry.potentialRevenue += val;

    if (order.status === "COMPLETED") {
      entry.licensesSold += qty;
      entry.revenue += val;
    }
  });

  const totalUnitsSold = Array.from(licenseMap.values()).reduce(
    (acc, item) => acc + item.licensesSold,
    0
  );

  const licenseData: LicenseDistributionItem[] = Array.from(licenseMap.values())
    .map((item) => ({
      ...item,
      shareRevenue: totalRevenue > 0 ? Number(((item.revenue / totalRevenue) * 100).toFixed(1)) : 0,
      shareUnits:
        totalUnitsSold > 0 ? Number(((item.licensesSold / totalUnitsSold) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.potentialRevenue - a.potentialRevenue);

  const topProducts = licenseData
    .filter((p) => p.licensesSold > 0 || p.totalLicensesRequested > 0)
    .slice(0, 4);

  // Evolução do Faturamento Acumulado (UC04)
  const chartDataMap = new Map<
    string,
    {
      date: string;
      orders: number;
      completedOrders: number;
      revenue: number;
      grossRevenue: number;
    }
  >();

  const formatDayMonth = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  if (periodo === "7" || periodo === "30") {
    const daysCount = periodo === "7" ? 7 : 30;
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDayMonth(d);
      chartDataMap.set(dateStr, {
        date: dateStr,
        orders: 0,
        completedOrders: 0,
        revenue: 0,
        grossRevenue: 0,
      });
    }
  }

  periodOrders.forEach((order) => {
    const dateStr = formatDayMonth(order.createdAt);
    if (!chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, {
        date: dateStr,
        orders: 0,
        completedOrders: 0,
        revenue: 0,
        grossRevenue: 0,
      });
    }
    const point = chartDataMap.get(dateStr)!;
    point.orders += 1;
    const orderVal = order.totalAmount ?? (order.product?.price || 0);

    if (order.status !== "CANCELLED") {
      point.grossRevenue += orderVal;
    }
    if (order.status === "COMPLETED") {
      point.completedOrders += 1;
      point.revenue += orderVal;
    }
  });

  // Garante pelo menos o dia atual caso o filtro "all" não tenha pedidos hoje
  const todayStr = formatDayMonth(new Date());
  if (!chartDataMap.has(todayStr)) {
    chartDataMap.set(todayStr, {
      date: todayStr,
      orders: 0,
      completedOrders: 0,
      revenue: 0,
      grossRevenue: 0,
    });
  }

  let runningCumulative = 0;
  let runningGrossCumulative = 0;
  const chartData: EvolutionDataPoint[] = Array.from(chartDataMap.values()).map((pt) => {
    runningCumulative += pt.revenue;
    runningGrossCumulative += pt.grossRevenue;
    return {
      ...pt,
      cumulativeRevenue: runningCumulative,
      cumulativeGrossRevenue: runningGrossCumulative,
    };
  });

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Faturamento Acumulado
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full text-emerald-600 dark:text-emerald-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full text-orange-600 dark:text-orange-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total de Pedidos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{ordersCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full text-purple-600 dark:text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Clientes Registrados
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{customersCount}</p>
          </div>
        </div>
      </div>

      {/* Módulo de Gráficos Gerenciais e Analytics (UC04) */}
      <AdminCharts data={chartData} licenseData={licenseData} periodoLabel={periodoLabel} />

      {/* Ranking Top Licenças + Relatório de Vendas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" />
            Ranking de Licenças
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Ainda não há vendas suficientes.
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.licensesSold} concluída(s) • {p.totalLicensesRequested} solicitada(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">
                      {p.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                    <p className="text-[11px] text-gray-400">{p.shareRevenue}% da receita</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Relatório de vendas */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Relatório de Vendas Recentes
            </h2>
            <a
              href={`/admin/pedidos/export${periodo !== "all" ? `?periodo=${periodo}` : ""}`}
              className="flex items-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary dark:hover:bg-gray-600 transition-colors"
            >
              <Download size={16} />
              Exportar CSV
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Nenhum pedido recebido ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 rounded-lg">
                    <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">ID</th>
                    <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Data</th>
                    <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">
                      Cliente
                    </th>
                    <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">
                      Licença de Software
                    </th>
                    <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">
                      Status
                    </th>
                    <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {order.createdAt.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                        {order.user?.name || "Desconhecido"}
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                        {order.product?.name || "Produto Excluído"} (x{order.quantity})
                      </td>
                      <td className="p-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === "COMPLETED"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {order.status === "COMPLETED"
                            ? "Concluído"
                            : order.status === "CANCELLED"
                            ? "Cancelado"
                            : "Pendente"}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                        {(order.totalAmount ?? (order.product?.price || 0)).toLocaleString(
                          "pt-BR",
                          { style: "currency", currency: "BRL" }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const periodo = typeof sp.periodo === "string" ? sp.periodo : "all";
  const forceSkeleton = sp.skeleton === "true" || sp.skeleton === "1";

  const dashboardSkeletonFallback = (
    <>
      <DashboardKpiCardsSkeleton />
      <DashboardChartsSkeleton />
      <DashboardBottomSkeleton />
    </>
  );

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gray-900 shadow-lg">
        <img
          src="/images/admin-banner.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 md:p-10">
          <div>
            <p className="text-blue-300 text-sm font-bold uppercase tracking-wider mb-1">
              Painel administrativo
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Dashboard & Analytics
            </h1>
            <p className="text-gray-300 mt-2 text-sm max-w-md">
              Acompanhe a evolução do faturamento acumulado e a distribuição de vendas por licença de software em tempo real.
            </p>
          </div>
          <PeriodFilter />
        </div>
      </div>

      {forceSkeleton ? (
        dashboardSkeletonFallback
      ) : (
        <Suspense key={periodo} fallback={dashboardSkeletonFallback}>
          <DashboardDataStream periodo={periodo} />
        </Suspense>
      )}
    </div>
  );
}
