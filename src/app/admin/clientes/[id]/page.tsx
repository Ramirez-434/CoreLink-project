import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Calendar, ShoppingBag, TrendingUp } from "lucide-react";

export default async function PerfilClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          product: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Calculate LTV
  const completedOrders = user.orders.filter(o => o.status === "COMPLETED");
  const ltv = completedOrders.reduce((acc, o) => acc + (o.totalAmount || (o.product?.price || 0)), 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/clientes" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors border border-gray-100 dark:border-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfil do Cliente</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Info Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center font-bold text-4xl border-4 border-white dark:border-gray-800 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                user.role === "ADMIN" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" :
                "bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400"
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-gray-400 dark:text-gray-400">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">E-mail</p>
                <p className="font-medium text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-gray-400 dark:text-gray-400">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Telefone</p>
                <p className="font-medium text-sm">{user.phone || "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-gray-400 dark:text-gray-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Data de Cadastro</p>
                <p className="font-medium text-sm">{user.createdAt.toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LTV Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 rounded-2xl shadow-sm p-8 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-2">Total Gasto (LTV)</p>
            <h3 className="text-4xl font-extrabold mb-6">
              {ltv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </h3>
            
            <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm">
              <ShoppingBag size={24} className="text-blue-200" />
              <div>
                <p className="text-sm font-bold">{completedOrders.length}</p>
                <p className="text-xs text-blue-200">Pedidos Concluídos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Pedidos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Histórico de Compras</h2>
        </div>
        
        {user.orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            Este cliente ainda não fez nenhum pedido.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">ID do Pedido</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Produto</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Data</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {user.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {order.product?.name || "Produto Removido"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qtd: {order.quantity}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {order.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "COMPLETED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        order.status === "CANCELLED" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}>
                        {order.status === "COMPLETED" ? "Concluído" : order.status === "CANCELLED" ? "Cancelado" : "Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
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
