import Link from "next/link";
import { CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildCommercialWhatsAppUrl } from "@/lib/whatsapp";

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const requestedOrderId = typeof sp.orderId === "string" ? sp.orderId : undefined;
  const session = await auth();

  const order = session?.user?.id
    ? await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          ...(requestedOrderId ? { id: requestedOrderId } : {}),
        },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const softwareName = order?.product?.name || "Licença Corporativa HJ INFO";
  const amount = order ? order.totalAmount ?? order.product.price : null;

  const whatsappUrl = buildCommercialWhatsAppUrl({
    orderId: order?.id || requestedOrderId || "NOVO",
    companyName: session?.user?.name || "Cliente Corporativo",
    customerName: session?.user?.name || undefined,
    softwares: [
      {
        orderId: order?.id || requestedOrderId || "NOVO",
        softwareName,
        quantity: order?.quantity || 1,
        totalAmount: amount ?? undefined,
      },
    ],
    totalValue: amount ?? undefined,
    context: "POS_VENDA",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px-200px)] py-12 px-4">
      <div className="text-center mb-8">
        <CheckCircle size={72} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-4" strokeWidth={1.75} />
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Pedido Registrado com Sucesso!
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md">
          Sua solicitação de licença corporativa foi vinculada à sua conta. Inicie o atendimento de implantação pelo WhatsApp ou acompanhe pelo seu painel.
        </p>
      </div>

      <div className="bg-primary text-white p-6 rounded-2xl shadow-lg w-full max-w-md flex justify-between items-center gap-4 mb-8">
        <div>
          <span className="block text-xs uppercase tracking-wider text-blue-100 font-semibold">
            {order ? `Pedido #${order.id.slice(0, 8).toUpperCase()}` : "Sistema Contratado"}
          </span>
          <span className="font-bold text-lg">{softwareName}</span>
        </div>
        {amount !== null && (
          <span className="font-extrabold text-lg tabular-nums shrink-0">
            {amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl hover-lift transition-all shadow-md text-sm"
        >
          <MessageCircle size={18} />
          Iniciar Implantação no WhatsApp
        </a>

        <Link
          href="/minha-conta"
          className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-primary-hover transition-all shadow-sm text-sm"
        >
          Ir para Minha Conta
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
