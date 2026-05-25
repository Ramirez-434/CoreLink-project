import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default async function AssinaturasPage() {
  // Fetch subscriptions with user and product info
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assinaturas (SaaS)</h1>
        <div className="flex gap-2">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
            {subscriptions.filter(s => s.status === "ACTIVE").length} Ativas
          </span>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            {subscriptions.filter(s => s.status === "PAST_DUE" || s.status === "CANCELED").length} Inativas
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {subscriptions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            Nenhuma assinatura encontrada. Marque um produto como "Assinatura" e receba pedidos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Cliente</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Plano (Produto)</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Ciclo</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Próxima Cobrança</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                      {sub.user?.name || "Desconhecido"}
                      <span className="block text-xs text-gray-500 font-normal">{sub.user?.email}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {sub.product?.name || "Produto Excluído"}
                      <span className="block text-xs text-primary font-bold">
                        {(sub.product?.price || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {sub.product?.billingCycle === "YEARLY" ? "Anual" : "Mensal"}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {sub.nextBillingDate ? sub.nextBillingDate.toLocaleDateString("pt-BR") : "Não definido"}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        sub.status === "ACTIVE" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        sub.status === "PAST_DUE" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {sub.status === "ACTIVE" ? <CheckCircle2 size={14} /> : 
                         sub.status === "PAST_DUE" ? <AlertCircle size={14} /> : 
                         <XCircle size={14} />}
                        {sub.status === "ACTIVE" ? "Ativo" : 
                         sub.status === "PAST_DUE" ? "Atrasado" : 
                         "Cancelado"}
                      </span>
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
