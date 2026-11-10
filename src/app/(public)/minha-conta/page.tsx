import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Package, Clock, CheckCircle, XCircle, MessageCircle, Building2, ExternalLink } from "lucide-react";
import { ProfileProgressBar } from "@/components/ui/ProfileProgressBar";
import { OnboardingTour } from "@/components/ui/OnboardingTour";
import { getSystemSetting } from "@/actions/settings";
import { buildCommercialWhatsAppUrl } from "@/lib/whatsapp";

export default async function MinhaContaPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const sp = searchParams ? await searchParams : {};
  const isNewOrderSuccess = sp.sucesso === "true";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  const isTourEnabled = await getSystemSetting("onboarding_tour_enabled", "false");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const companyDisplayName = user.companyName?.trim() || user.name;

  // Link consolidado de Pós-Venda B2B (UC05) com todos os softwares ativos/contratados pelo cliente
  const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
  const consolidatedWhatsAppUrl =
    activeOrders.length > 0
      ? buildCommercialWhatsAppUrl({
          orderId: activeOrders[0].id,
          companyName: companyDisplayName,
          customerName: user.name,
          document: user.document,
          stateRegistration: user.stateRegistration,
          softwares: activeOrders.map((o) => ({
            orderId: o.id,
            softwareName: o.product.name,
            quantity: o.quantity || 1,
            totalAmount: o.totalAmount ?? o.product.price,
            status: o.status,
          })),
          totalValue: activeOrders.reduce(
            (acc, o) => acc + (o.totalAmount ?? o.product.price),
            0
          ),
          context: "POS_VENDA",
        })
      : null;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PROCESSING":
        return (
          <span className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">
            <Clock size={14} /> Processando
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle size={14} /> Concluído
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
            <XCircle size={14} /> Cancelado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Minha Conta Corporativa
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Olá, <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>! Gerencie suas licenças e acione o pós-venda B2B.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center sm:justify-end gap-1.5">
            <Building2 size={15} className="text-primary" />
            {companyDisplayName}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {user.email} {user.document ? `• CNPJ/CPF: ${user.document}` : ""}
          </p>
        </div>
      </div>

      <ProfileProgressBar user={user} />

      {/* Card de Integração B2B via WhatsApp API (UC05) */}
      {consolidatedWhatsAppUrl && (
        <div
          className={`mb-10 rounded-2xl p-6 md:p-8 border transition-all ${
            isNewOrderSuccess
              ? "bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
              : "bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-blue-800/60 shadow-md"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                <MessageCircle size={14} />
                Integração B2B via WhatsApp API (UC05)
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-white">
                {isNewOrderSuccess
                  ? "Pedido Registrado! Inicie sua Implantação no WhatsApp Comercial"
                  : "Atendimento Comercial e Pós-Venda Direto (B2B)"}
              </h3>
              <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                Envie automaticamente para a equipe da <strong>HJ Infor</strong> o resumo parametrizado contendo o{" "}
                <strong>ID do seu pedido (#{activeOrders[0].id.slice(0, 8).toUpperCase()})</strong>, a{" "}
                <strong>lista de softwares contratados ({activeOrders.length} sistema{activeOrders.length > 1 ? "s" : ""})</strong>{" "}
                e a <strong>Razão Social ({companyDisplayName})</strong> para liberação imediata e suporte de onboarding.
              </p>
            </div>

            <a
              href={consolidatedWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] text-sm"
            >
              <MessageCircle size={20} className="fill-slate-950" />
              Atendimento Pós-Venda via WhatsApp
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      )}

      <div className="space-y-8" id="tour-pedidos">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package size={24} className="text-primary" />
          Meus Pedidos ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Nenhum pedido ainda
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Você ainda não adquiriu nenhum de nossos sistemas.
            </p>
            <a
              href="/sistemas"
              className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-full hover:bg-primary-hover transition-colors"
            >
              Explorar Sistemas
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => {
              const singleOrderWhatsAppUrl = buildCommercialWhatsAppUrl({
                orderId: order.id,
                companyName: companyDisplayName,
                customerName: user.name,
                document: user.document,
                stateRegistration: user.stateRegistration,
                softwares: [
                  {
                    orderId: order.id,
                    softwareName: order.product.name,
                    quantity: order.quantity || 1,
                    totalAmount: order.totalAmount ?? order.product.price,
                    status: order.status,
                  },
                ],
                totalValue: order.totalAmount ?? order.product.price,
                context: "POS_VENDA",
              });

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {order.product.name}
                        </h3>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">
                          Pedido #{order.id.slice(0, 8).toUpperCase()} • {order.quantity || 1} licença(s)
                        </p>
                      </div>
                      {getStatusDisplay(order.status)}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 px-3 py-2 rounded-xl mb-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Razão Social vinculada:
                      </span>{" "}
                      {companyDisplayName}
                    </div>
                  </div>

                  <div className="space-y-4 mt-2 border-t border-gray-50 dark:border-gray-800 pt-4">
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Comprado em:
                        <br />
                        <span className="font-medium text-gray-900 dark:text-gray-300">
                          {order.createdAt.toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-primary">
                        {(order.totalAmount ?? order.product.price).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </div>
                    </div>

                    {/* Botão individual de Pós-Venda via WhatsApp API (UC05) */}
                    <a
                      href={singleOrderWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
                    >
                      <MessageCircle size={15} />
                      Pós-Venda / Implantação no WhatsApp (#{order.id.slice(0, 8).toUpperCase()})
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          className="mt-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-8"
          id="tour-lgpd"
        >
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
