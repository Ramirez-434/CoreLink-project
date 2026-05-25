import { TrendingUp, Users, ShoppingBag, DollarSign, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminCharts } from "./AdminCharts";

export default async function AdminDashboard() {
  // Fetch real data
  const ordersCount = await prisma.order.count();
  
  const customersCount = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
    },
  });

  // Calculate total revenue from completed orders
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    include: { product: true }
  });
  
  const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.totalAmount || (order.product?.price || 0)), 0);
  const ticketMedio = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Top 3 Products
  const productSalesMap = new Map();
  completedOrders.forEach(order => {
    if (order.product) {
      const pid = order.product.id;
      if (!productSalesMap.has(pid)) {
        productSalesMap.set(pid, { name: order.product.name, sales: 0, revenue: 0 });
      }
      const data = productSalesMap.get(pid);
      data.sales += order.quantity || 1;
      data.revenue += (order.totalAmount || order.product.price);
    }
  });
  const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.sales - a.sales).slice(0, 3);

  // Compute Data for Charts (Last 7 days)
  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getDate()}/${d.getMonth()+1}`;
    chartDataMap.set(dateStr, { date: dateStr, orders: 0, revenue: 0 });
  }

  const allOrders = await prisma.order.findMany({
    where: { 
      createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    },
    include: { product: true }
  });

  allOrders.forEach(order => {
    const dateStr = `${order.createdAt.getDate()}/${order.createdAt.getMonth()+1}`;
    if (chartDataMap.has(dateStr)) {
      const data = chartDataMap.get(dateStr);
      data.orders += 1;
      if (order.status === "COMPLETED") {
        data.revenue += order.totalAmount || (order.product?.price || 0);
      }
    }
  });

  const chartData = Array.from(chartDataMap.values());

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        
        {/* Date Filter Mock */}
        <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400">
          <option>Todos os Tempos</option>
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Faturamento</p>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Clientes Registrados</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{customersCount}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AdminCharts data={chartData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" />
            Top Produtos
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Ainda não há vendas suficientes.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.sales} vendas</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary text-sm">
                    {p.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Relatórios Export Mock */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Relatório de Vendas Recentes</h2>
          <button className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
            Exportar PDF
          </button>
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
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Cliente</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Produto</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{order.id.slice(0,8)}</td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {order.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">{order.user?.name || "Desconhecido"}</td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{order.product?.name || "Produto Excluído"} (x{order.quantity})</td>
                    <td className="p-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "COMPLETED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        order.status === "CANCELLED" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}>
                        {order.status === "COMPLETED" ? "Concluído" : order.status === "CANCELLED" ? "Cancelado" : "Pendente"}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                      {(order.totalAmount || (order.product?.price || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
