import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { ProfileProgressBar } from "@/components/ui/ProfileProgressBar";
import { OnboardingTour } from "@/components/ui/OnboardingTour";
import { getSystemSetting } from "@/actions/settings";

export default async function MinhaContaPage() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  const isTourEnabled = await getSystemSetting("onboarding_tour_enabled", "false");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case "PENDING":
        return <span className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14} /> Processando</span>;
      case "COMPLETED":
        return <span className="flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} /> Concluído</span>;
      case "CANCELLED":
        return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={14} /> Cancelado</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Minha Conta</h1>
          <p className="text-gray-500 dark:text-gray-400">Olá, <span className="font-bold text-gray-900 dark:text-white">{session.user.name}</span>! Aqui estão seus sistemas.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{session.user.email}</p>
        </div>
      </div>

      <ProfileProgressBar user={user} />

      <div className="space-y-8" id="tour-pedidos">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package size={24} className="text-primary" />
          Meus Pedidos ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhum pedido ainda</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Você ainda não adquiriu nenhum de nossos sistemas.</p>
            <a href="/sistemas" className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-full hover:bg-primary-hover transition-colors">
              Explorar Sistemas
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{order.product.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                  {getStatusDisplay(order.status)}
                </div>
                
                <div className="flex justify-between items-end mt-8 border-t border-gray-50 dark:border-gray-800 pt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Comprado em:<br/>
                    <span className="font-medium text-gray-900 dark:text-gray-300">
                      {order.createdAt.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-primary">
                    {order.product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-8" id="tour-lgpd">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            Privacidade e Seus Dados (LGPD)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            Nós valorizamos sua privacidade. De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar a exportação de todos os dados vinculados à sua conta, bem como solicitar a exclusão permanente dos seus registros de nossos servidores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm rounded-xl transition-colors">
              Solicitar Exportação de Dados
            </button>
            <button className="px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl transition-colors">
              Solicitar Exclusão da Conta
            </button>
          </div>
        </div>
      </div>
      
      {isTourEnabled === "true" && <OnboardingTour />}
    </div>
  );
}
