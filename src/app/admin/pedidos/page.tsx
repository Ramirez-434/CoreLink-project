import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmationEmail } from "@/actions/email";

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
      coupon: true
    }
  });

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const abandonedCartsCount = orders.filter(o => o.status === "PENDING" && o.createdAt < twoHoursAgo).length;

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    
    if (id && status) {
      const order = await prisma.order.findUnique({ where: { id }, include: { product: true } });
      if (!order) return;

      await prisma.order.update({
        where: { id },
        data: { status }
      });

      // Handle stock and subscriptions if order is completed
      if (status === "COMPLETED" && order.status !== "COMPLETED" && order.product) {
        // Decrease stock
        await prisma.product.update({
          where: { id: order.productId },
          data: { stock: { decrement: order.quantity } }
        });

        // Create subscription if product is SaaS
        if (order.product.isSubscription) {
          const nextBillingDate = new Date();
          if (order.product.billingCycle === "YEARLY") {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          } else {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }

          await prisma.subscription.create({
            data: {
              userId: order.userId,
              productId: order.productId,
              status: "ACTIVE",
              nextBillingDate
            }
          });
        }

        // Send Email Notification
        if (order.user && order.user.email) {
          await sendOrderConfirmationEmail(order.user.email, order.user.name, order.product.name, order.id);
        }
      }

      revalidatePath("/admin/pedidos");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/produtos");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Pedidos</h1>
        <div className="flex flex-wrap gap-2">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            {orders.filter(o => o.status === "COMPLETED").length} Concluídos
          </span>
          <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            {orders.filter(o => o.status === "PENDING").length} Pendentes
          </span>
          {abandonedCartsCount > 0 && (
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              🛒 {abandonedCartsCount} Abandonados
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            Nenhum pedido realizado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">ID do Pedido</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Data</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Cliente</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Produto</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Valor Total</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap text-center">Status / Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-4 text-xs font-mono text-gray-500 dark:text-gray-400">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {order.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center justify-between">
                        <span>{order.user?.name || "Desconhecido"}</span>
                        {order.user?.phone && (
                          <a 
                            href={`https://wa.me/55${order.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${order.user.name.split(' ')[0]}, vi que você iniciou o pedido #${order.id.slice(0,8).toUpperCase()} no CoreLink! Como posso te ajudar a finalizar?`)}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full transition-colors flex-shrink-0"
                            title="Contato via WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          </a>
                        )}
                      </div>
                      {order.status === "PENDING" && order.createdAt < twoHoursAgo && (
                        <span className="text-[10px] bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-md mt-1 inline-block">Carrinho Abandonado</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.product?.name || "Excluído"} (x{order.quantity})
                      {order.coupon && <span className="block text-xs text-primary font-bold mt-1">🎟️ {order.coupon.code}</span>}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                      {(order.totalAmount || (order.product?.price || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="p-4">
                      <form action={updateStatus} className="flex items-center justify-center gap-2">
                        <input type="hidden" name="id" value={order.id} />
                        <select 
                          name="status" 
                          defaultValue={order.status}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 cursor-pointer focus:outline-none transition-colors dark:bg-gray-800 ${
                            order.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800" :
                            order.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800" :
                            "bg-yellow-50 text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800"
                          }`}
                        >
                          <option value="PENDING">Pendente</option>
                          <option value="COMPLETED">Concluído</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                        <button type="submit" className="text-xs bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 rounded-full hover:bg-primary dark:hover:bg-gray-600 transition-colors font-medium hover-lift">
                          Salvar
                        </button>
                      </form>
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
