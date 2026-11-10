import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Building2,
  ExternalLink,
  UserCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ProfileProgressBar } from "@/components/ui/ProfileProgressBar";
import { OnboardingTour } from "@/components/ui/OnboardingTour";
import { LgpdPrivacySection } from "@/components/ui/LgpdPrivacySection";
import { WelcomeTourButton } from "@/components/ui/WelcomeTourButton";
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
  const isWelcome = sp.welcome === "true";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  const isTourEnabled = await getSystemSetting("onboarding_tour_enabled", "true");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const starterProducts =
    orders.length === 0
      ? await prisma.product.findMany({
          where: { isAvailable: true },
          orderBy: { createdAt: "desc" },
          take: 2,
        })
      : [];

  const companyDisplayName = user.companyName?.trim() || user.name;

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
          <span className="shrink-0 whitespace-nowrap flex items-center gap-1.5 text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
            <Clock size={14} className="shrink-0" /> Em Implantação
          </span>
        );
      case "COMPLETED":
        return (
          <span className="shrink-0 whitespace-nowrap flex items-center gap-1.5 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle size={14} className="shrink-0" /> Ativo
          </span>
        );
      case "CANCELLED":
        return (
          <span className="shrink-0 whitespace-nowrap flex items-center gap-1.5 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold">
            <XCircle size={14} className="shrink-0" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="shrink-0 whitespace-nowrap px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-5xl">
      {/* First-Run Welcome Banner after Instant Signup (Focused, No Competing Primary CTA) */}
      {isWelcome && (
        <div
          role="status"
          className="mb-8 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3 min-w-0">
            <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-100 break-words">
                Bem-vindo à HJ Infor, {user.name}! Sua conta corporativa já está ativa.
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                Seu acesso foi liberado automaticamente. Complete os dados fiscais da empresa abaixo ou conheça o painel no tour guiado.
              </p>
            </div>
          </div>
          {isTourEnabled === "true" && <WelcomeTourButton />}
        </div>
      )}

      {/* Account Header with Persistent Profile Edit Action */}
      <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Minha Conta Corporativa
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-words">
            Olá, <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>. Gerencie suas licenças, dados fiscais e implantação assistida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 min-w-0">
          <div className="md:text-right min-w-0 max-w-full">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center md:justify-end gap-1.5 break-words">
              <Building2 size={15} className="text-primary dark:text-blue-400 shrink-0" />
              <span className="truncate max-w-[260px] sm:max-w-[340px]">{companyDisplayName}</span>
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 break-all sm:break-normal">
              {user.email} {user.document ? `• CNPJ/CPF: ${user.document}` : "• CNPJ não informado"}
            </p>
          </div>

          <Link
            href="/minha-conta/perfil"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-blue-400 bg-blue-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 px-3.5 py-2.5 rounded-xl transition-colors min-h-[44px]"
          >
            <UserCheck size={14} />
            Dados Fiscais e Perfil
          </Link>
        </div>
      </div>

      <ProfileProgressBar user={user} />

      {/* B2B WhatsApp Implementation Card */}
      {consolidatedWhatsAppUrl && (
        <section
          id="tour-whatsapp"
          aria-labelledby="whatsapp-b2b-heading"
          className={`mb-10 rounded-2xl p-6 md:p-8 border transition-all ${
            isNewOrderSuccess
              ? "bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border-emerald-500 shadow-lg"
              : "bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-blue-800/60 shadow-md"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <h2
                id="whatsapp-b2b-heading"
                className="text-xl md:text-2xl font-extrabold text-white tracking-tight"
              >
                {isNewOrderSuccess
                  ? "Pedido Registrado! Inicie sua Implantação no WhatsApp Comercial"
                  : "Implantação Assistida e Suporte Pós-Venda B2B"}
              </h2>
              <p className="text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Envie para a equipe de implantação da <strong>HJ Infor</strong> o resumo automático com o{" "}
                <strong>pedido #{activeOrders[0].id.slice(0, 8).toUpperCase()}</strong>,{" "}
                <strong>
                  {activeOrders.length} sistema{activeOrders.length > 1 ? "s" : ""} contratado{activeOrders.length > 1 ? "s" : ""}
                </strong>{" "}
                e a identificação de <strong>{companyDisplayName}</strong> para agendamento e ativação das licenças.
              </p>
            </div>

            <a
              href={consolidatedWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center gap-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold px-6 py-4 rounded-xl shadow-md transition-all text-sm min-h-[48px]"
            >
              <MessageCircle size={20} className="fill-slate-950 shrink-0" />
              Iniciar Implantação via WhatsApp
              <ExternalLink size={15} className="shrink-0" />
            </a>
          </div>
        </section>
      )}

      <section className="space-y-6" id="tour-pedidos" aria-labelledby="orders-section-heading">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="orders-section-heading"
            className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <Package size={22} className="text-primary dark:text-blue-400 shrink-0" />
            <span>
              Meus Sistemas e Licenças{" "}
              <span className="tabular-nums">({orders.length})</span>
            </span>
          </h2>
          {orders.length > 0 && (
            <Link
              href="/sistemas"
              className="text-xs font-bold text-primary dark:text-blue-400 hover:underline inline-flex items-center gap-1 min-h-[44px] px-2"
            >
              Contratar novas licenças
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 sm:p-10">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 dark:bg-blue-950/60 text-primary dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                <Package size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Como funciona a ativação dos seus sistemas na HJ Infor
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Assim que você escolher um sistema, suas licenças, status de implantação e o canal direto de suporte técnico via WhatsApp ficam disponíveis neste painel.
              </p>
            </div>

            {/* 3-Step Visual Preview of Populated State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8 text-left">
              <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-4">
                <div className="text-xs font-extrabold text-primary dark:text-blue-400 mb-1">
                  1. Escolha a Solução
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Selecione o software ideal para o porte e segmento da sua operação.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-4">
                <div className="text-xs font-extrabold text-primary dark:text-blue-400 mb-1">
                  2. Vínculo Fiscal (CNPJ)
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Licenças e NF-e parametrizadas diretamente para <strong>{companyDisplayName}</strong>.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-4">
                <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mb-1">
                  3. Implantação Assistida
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Acompanhamento direto pelo WhatsApp Comercial até a entrada em produção.
                </p>
              </div>
            </div>

            {/* Quick-Start Software Suggestions */}
            {starterProducts.length > 0 && (
              <div className="max-w-3xl mx-auto mb-8">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 text-center sm:text-left">
                  Sistemas em destaque prontos para implantação:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {starterProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/produto/${prod.id}`}
                      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-blue-400 rounded-xl p-4 flex items-center justify-between gap-4 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                          {prod.description}
                        </p>
                        <span className="inline-block text-xs font-extrabold text-primary dark:text-blue-400 mt-1.5 tabular-nums">
                          {prod.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </div>
                      <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-gray-800 text-primary dark:text-blue-400 group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sistemas"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-3 px-6 rounded-xl hover:bg-primary-hover transition-colors shadow-sm min-h-[44px]"
              >
                Explorar Catálogo Completo
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contato"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 text-sm font-bold py-3 px-6 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
              >
                Falar com Consultor Comercial
              </Link>
            </div>
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
                  className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {order.product.name}
                        </h3>
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                          Pedido #{order.id.slice(0, 8).toUpperCase()} • {order.quantity || 1} licença(s)
                        </p>
                      </div>
                      {getStatusDisplay(order.status)}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 px-3 py-2 rounded-xl mb-4">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Empresa licenciada:
                      </span>{" "}
                      {companyDisplayName}
                    </div>
                  </div>

                  <div className="space-y-4 mt-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Contratado em
                        <br />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {order.createdAt.toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-primary dark:text-blue-400 tabular-nums">
                        {(order.totalAmount ?? order.product.price).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </div>
                    </div>

                      <a
                        href={singleOrderWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors min-h-[44px] print:hidden"
                      >
                        <MessageCircle size={15} />
                        Suporte deste pedido no WhatsApp (#{order.id.slice(0, 8).toUpperCase()})
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="print:hidden">
            <LgpdPrivacySection email={user.email} activeOrderCount={activeOrders.length} />
          </div>
        </section>

      {isTourEnabled === "true" && (
        <OnboardingTour suppressAutoStart={isNewOrderSuccess || isWelcome} />
      )}
    </div>
  );
}
