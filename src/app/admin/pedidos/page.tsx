import { prisma } from "@/lib/prisma";
import { Search, Download, CheckCircle2, Clock, XCircle } from "lucide-react";
import { buildOrdersWhere } from "@/lib/orderFilters";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { buildAdminToClientWhatsAppUrl } from "@/lib/whatsapp";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";

  const orders = await prisma.order.findMany({
    where: buildOrdersWhere({ q, status }),
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
      coupon: true,
    },
  });

  // Contadores globais (independentes dos filtros)
  const allStatuses = await prisma.order.findMany({
    select: { status: true, createdAt: true },
  });
  const completedCount = allStatuses.filter((o) => o.status === "COMPLETED").length;
  const processingCount = allStatuses.filter(
    (o) => o.status === "PENDING" || o.status === "PROCESSING"
  ).length;
  const cancelledCount = allStatuses.filter((o) => o.status === "CANCELLED").length;

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const abandonedCartsCount = allStatuses.filter(
    (o) => (o.status === "PENDING" || o.status === "PROCESSING") && o.createdAt < twoHoursAgo
  ).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestão Dinâmica de Pedidos
            </h1>
            <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              UC04
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie e atualize em tempo real o status das licenças comercializadas (Processing, Completed, Cancelled).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 tabular-nums min-h-[36px]">
            <CheckCircle2 size={14} />
            {completedCount} Concluídos
          </span>
          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 tabular-nums min-h-[36px]">
            <Clock size={14} />
            {processingCount} Em Implantação
          </span>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 tabular-nums min-h-[36px]">
            <XCircle size={14} />
            {cancelledCount} Cancelados
          </span>
          {abandonedCartsCount > 0 && (
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 tabular-nums min-h-[36px]">
              🛒 {abandonedCartsCount} Em espera (+2h)
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por cliente, e-mail, produto ou ID do pedido..."
            className="w-full pl-11 pr-4 py-2.5 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Processando (Processing)</option>
          <option value="COMPLETED">Concluído (Completed)</option>
          <option value="CANCELLED">Cancelado (Cancelled)</option>
        </select>
        <button
          type="submit"
          className="px-6 py-2.5 min-h-[44px] rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors text-sm shrink-0"
        >
          Filtrar
        </button>
        {(q || status) && (
          <a
            href="/admin/pedidos"
            className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-center text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm shrink-0"
          >
            Limpar
          </a>
        )}
        <a
          href={`/admin/pedidos/export?${new URLSearchParams({
            ...(q ? { q } : {}),
            ...(status ? { status } : {}),
          }).toString()}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-gray-900 dark:bg-gray-700 text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm shrink-0"
        >
          <Download size={16} /> CSV
        </a>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            {q || status
              ? "Nenhum pedido encontrado com esses filtros."
              : "Nenhum pedido realizado ainda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">
                    ID do Pedido
                  </th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">
                    Data
                  </th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">
                    Cliente
                  </th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">
                    Licença de Software
                  </th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">
                    Valor Total
                  </th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap text-center">
                    Status / Alteração Dinâmica (UC04)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-4 text-xs font-mono font-bold text-gray-600 dark:text-gray-300 tabular-nums">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap tabular-nums">
                      {order.createdAt.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span>{order.user?.companyName || order.user?.name || "Desconhecido"}</span>
                          {order.user?.companyName && order.user?.name && (
                            <span className="block text-xs font-medium text-blue-600 dark:text-blue-400">
                              Resp.: {order.user.name}
                            </span>
                          )}
                          {order.user?.email && (
                            <span className="block text-xs font-normal text-gray-400">
                              {order.user.email}
                            </span>
                          )}
                        </div>
                        {order.user?.phone && (
                          <a
                            href={buildAdminToClientWhatsAppUrl({
                              clientPhone: order.user.phone,
                              orderId: order.id,
                              companyName: order.user.companyName || order.user.name,
                              customerName: order.user.name.split(" ")[0],
                              softwareName: order.product?.name || "Software Corporativo",
                              quantity: order.quantity || 1,
                              totalAmount: order.totalAmount ?? (order.product?.price || 0),
                              status: order.status,
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-full transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold shadow-sm min-h-[44px]"
                            title="Atendimento e Pós-Venda via WhatsApp API (UC05)"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="14"
                              height="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            Pós-Venda B2B
                          </a>
                        )}
                      </div>
                      {(order.status === "PENDING" || order.status === "PROCESSING") &&
                        order.createdAt < twoHoursAgo && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-md mt-1 inline-block font-medium">
                            Aguardando aprovação (+2h)
                          </span>
                        )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{order.product?.name || "Excluído"}</span> (x
                      {order.quantity})
                      {order.coupon && (
                        <span className="block text-xs text-primary font-bold mt-1">
                          🎟️ {order.coupon.code}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                      {(order.totalAmount ?? (order.product?.price || 0)).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="p-4">
                      <OrderStatusControl
                        orderId={order.id}
                        initialStatus={order.status}
                        customerName={order.user?.name || "Cliente"}
                        productName={order.product?.name || "Software"}
                      />
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
