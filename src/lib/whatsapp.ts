import { sanitizeTextInput, formatCpfCnpjMask } from "@/lib/sanitize";

export const HJ_INFOR_COMMERCIAL_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_COMERCIAL || "5563999999999";

export interface WhatsAppOrderItem {
  orderId?: string;
  softwareName: string;
  quantity: number;
  totalAmount?: number;
  status?: string;
}

export interface WhatsAppB2BPayload {
  orderId: string;
  companyName: string; // Razão Social da empresa cliente (fallback para nome do titular)
  customerName?: string;
  document?: string | null; // CNPJ ou CPF
  stateRegistration?: string | null; // Inscrição Estadual
  softwares: WhatsAppOrderItem[];
  totalValue?: number;
  context?: "POS_VENDA" | "CHECKOUT" | "SUPORTE_IMPLANTACAO";
}

/**
 * Gera link parametrizado da WhatsApp API (UC05) para o cliente acionar
 * o Atendimento Comercial e Pós-Venda da HJ Infor enviando:
 * - ID do pedido
 * - Razão Social da empresa cliente (e CNPJ se cadastrado)
 * - Lista de softwares contratados
 */
export function buildCommercialWhatsAppUrl(
  payload: WhatsAppB2BPayload,
  commercialPhone: string = HJ_INFOR_COMMERCIAL_WHATSAPP
): string {
  const cleanPhone = commercialPhone.replace(/\D/g, "");
  const headerTitle =
    payload.context === "CHECKOUT"
      ? "*[CORELINK B2B — NOVO PEDIDO / IMPLANTAÇÃO]*"
      : "*[CORELINK B2B — ATENDIMENTO E PÓS-VENDA]*";

  const softwaresList = payload.softwares
    .map((item, idx) => {
      const priceStr =
        typeof item.totalAmount === "number"
          ? ` — ${item.totalAmount.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}`
          : "";
      const idPrefix = item.orderId ? `[Pedido #${item.orderId.slice(0, 8).toUpperCase()}] ` : "";
      return `${idx + 1}. ${idPrefix}*${item.softwareName}* (${item.quantity} licença${
        item.quantity > 1 ? "s" : ""
      })${priceStr}`;
    })
    .join("\n");

  const safeCompany = sanitizeTextInput(payload.companyName, 120) || "Empresa Cliente";
  const safeCustomer = payload.customerName ? sanitizeTextInput(payload.customerName, 100) : "";
  const safeDocument = payload.document ? formatCpfCnpjMask(payload.document) : "";
  const safeIE = payload.stateRegistration
    ? sanitizeTextInput(payload.stateRegistration, 20)
    : "";

  const lines = [
    headerTitle,
    "",
    `Olá, equipe comercial da *HJ Infor*! Gostaria de atendimento referente à contratação de software corporativo:`,
    "",
    `🏢 *Razão Social / Empresa:* ${safeCompany}`,
    ...(safeCustomer && safeCustomer !== safeCompany
      ? [`👤 *Responsável:* ${safeCustomer}`]
      : []),
    ...(safeDocument ? [`📄 *CNPJ/CPF:* ${safeDocument}`] : []),
    ...(safeIE ? [`🏛️ *Inscrição Estadual:* ${safeIE}`] : []),
    `🔖 *ID do Pedido:* #${payload.orderId.slice(0, 8).toUpperCase()}`,
    "",
    `💻 *Lista de Softwares Contratados:*`,
    softwaresList,
    ...(typeof payload.totalValue === "number"
      ? [
          "",
          `💰 *Valor Total Consolidado:* ${payload.totalValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}`,
        ]
      : []),
    "",
    `Aguardo orientações para liberação de chave de licença e onboarding técnico.`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
}

/**
 * Gera link parametrizado da WhatsApp API (UC05) para o Administrador
 * contatar ativamente a empresa cliente no pós-venda.
 */
export function buildAdminToClientWhatsAppUrl(params: {
  clientPhone: string;
  orderId: string;
  companyName: string;
  customerName: string;
  softwareName: string;
  quantity: number;
  totalAmount: number;
  status: string;
}): string {
  const digits = params.clientPhone.replace(/\D/g, "");
  const fullPhone = digits.startsWith("55") ? digits : `55${digits}`;
  const shortOrderId = params.orderId.slice(0, 8).toUpperCase();

  const statusText =
    params.status === "COMPLETED"
      ? "Concluído (Licença Liberada)"
      : params.status === "CANCELLED"
      ? "Cancelado"
      : "Em Processamento";

  const lines = [
    `*[HJ INFOR — PÓS-VENDA E SUPORTE B2B]*`,
    "",
    `Olá *${params.customerName}*, falamos do setor comercial/pós-venda da *HJ Infor (CoreLink)*!`,
    "",
    `Estamos entrando em contato referente ao pedido corporativo abaixo:`,
    `🔖 *ID do Pedido:* #${shortOrderId}`,
    `🏢 *Razão Social:* ${params.companyName}`,
    `💻 *Software Contratado:* ${params.softwareName} (${params.quantity} licença${
      params.quantity > 1 ? "s" : ""
    })`,
    `💰 *Valor:* ${params.totalAmount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`,
    `📌 *Status Atual:* ${statusText}`,
    "",
    `Como podemos auxiliar na implantação e ativação do sistema na sua empresa?`,
  ];

  return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}
