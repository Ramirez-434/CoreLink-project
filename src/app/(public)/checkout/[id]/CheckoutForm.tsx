"use client";

import { useState, useRef } from "react";
import { createOrder } from "@/actions/order";
import { useRouter } from "next/navigation";
import {
  Package,
  ShieldCheck,
  CreditCard,
  Tag,
  Check,
  X,
  Zap,
  MessageCircle,
  CheckCircle2,
  Building2,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";
import { validateCoupon } from "@/actions/coupon";
import { toast } from "sonner";
import { buildCommercialWhatsAppUrl } from "@/lib/whatsapp";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

type ClientProfile = {
  name: string;
  companyName: string;
  document?: string | null;
  stateRegistration?: string | null;
};

export function CheckoutForm({
  product,
  clientProfile,
}: {
  product: Product;
  clientProfile?: ClientProfile;
}) {
  // Controle de estado reativo (isLoading) + trava síncrona (useRef) + Chave de Idempotência contra ataque de duplo clique
  const [isLoading, setIsLoading] = useState(false);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const checkoutLockRef = useRef(false);
  const couponLockRef = useRef(false);
  const idempotencyKeyRef = useRef<string>(
    `chk_${product.id}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  );

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const router = useRouter();

  const handleApplyCoupon = async () => {
    if (!couponCode || isCouponLoading || isLoading || couponLockRef.current) return;
    couponLockRef.current = true;
    setIsCouponLoading(true);
    setCouponError("");

    try {
      const res = await validateCoupon(couponCode);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        toast.success(`Cupom "${res.coupon.code}" aplicado com sucesso! 🎉`);
      } else {
        setCouponError(res.error || "Cupom inválido");
        setAppliedCoupon(null);
        toast.error(res.error || "Cupom inválido ou expirado.");
      }
    } finally {
      setIsCouponLoading(false);
      couponLockRef.current = false;
    }
  };

  const removeCoupon = () => {
    if (isLoading || isCouponLoading) return;
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.info("Cupom removido.");
  };

  const finalPrice = appliedCoupon
    ? appliedCoupon.discountType === "PERCENTAGE"
      ? product.price - product.price * (appliedCoupon.discountValue / 100)
      : product.price - appliedCoupon.discountValue
    : product.price;

  const displayPrice = finalPrice < 0 ? 0 : finalPrice;

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Bloqueio imediato contra duplo clique (< 16ms) ou submissão concorrente
    if (checkoutLockRef.current || isLoading || !lgpdConsent || Boolean(createdOrderId)) {
      return;
    }

    checkoutLockRef.current = true;
    setIsLoading(true);

    const toastId = toast.loading("Processando seu pedido com proteção de idempotência...");

    try {
      const res = await createOrder(
        product.id,
        appliedCoupon?.id,
        idempotencyKeyRef.current
      );

      if (res.success && res.orderId) {
        setCreatedOrderId(res.orderId);
        setIsLoading(false);
        toast.success("Pedido realizado com sucesso! 🎉", {
          id: toastId,
          description: `Pedido #${res.orderId
            .slice(0, 8)
            .toUpperCase()} gravado sem duplicidade. Inicie o atendimento B2B via WhatsApp ou acesse Minha Conta.`,
          duration: 5000,
        });
      } else {
        idempotencyKeyRef.current = `chk_${product.id}_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        toast.error("Erro ao processar pedido.", {
          id: toastId,
          description: res.error || "Ocorreu um erro inesperado. Tente novamente.",
          duration: 6000,
        });
        setIsLoading(false);
        checkoutLockRef.current = false;
      }
    } catch {
      idempotencyKeyRef.current = `chk_${product.id}_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      toast.error("Erro de comunicação ao processar pedido.", {
        id: toastId,
      });
      setIsLoading(false);
      checkoutLockRef.current = false;
    }
  };

  const companyName = clientProfile?.companyName || "Empresa Cliente";

  // Link parametrizado pós-checkout (UC05)
  const whatsappUrl = createdOrderId
    ? buildCommercialWhatsAppUrl({
        orderId: createdOrderId,
        companyName,
        customerName: clientProfile?.name,
        document: clientProfile?.document,
        stateRegistration: clientProfile?.stateRegistration,
        softwares: [
          {
            orderId: createdOrderId,
            softwareName: product.name,
            quantity: 1,
            totalAmount: displayPrice,
            status: "PENDING",
          },
        ],
        totalValue: displayPrice,
        context: "CHECKOUT",
      })
    : "";

  if (createdOrderId) {
    const shortId = createdOrderId.slice(0, 8).toUpperCase();
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-emerald-200 dark:border-emerald-800/60 p-8 md:p-12 transition-colors">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 mb-2">
              Pedido #{shortId} Persistido no PostgreSQL
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Contratação Registrada com Sucesso!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Acione agora o canal direto de pós-venda B2B no WhatsApp Comercial da{" "}
              <strong>HJ Infor</strong> com todos os dados parametrizados da sua empresa.
            </p>
          </div>

          {/* Resumo Parametrizado UC05 */}
          <div className="bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">ID do Pedido:</span>
              <span className="font-mono font-extrabold text-primary">#{shortId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                <Building2 size={15} /> Razão Social da Empresa:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{companyName}</span>
            </div>
            {clientProfile?.document && (
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2.5">
                <span className="text-gray-500 dark:text-gray-400 font-medium">CNPJ / CPF:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {clientProfile.document}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Software Contratado:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {product.name} (1 licença)
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Valor Total:</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {displayPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 text-sm"
            >
              <MessageCircle size={20} />
              Iniciar Pós-Venda no WhatsApp Comercial (UC05)
            </a>
            <button
              type="button"
              disabled={isNavigating}
              onClick={() => {
                if (isNavigating) return;
                setIsNavigating(true);
                router.push("/minha-conta?sucesso=true");
              }}
              className="sm:w-52 bg-gray-900 dark:bg-gray-800 hover:bg-primary text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:pointer-events-none"
            >
              {isNavigating ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  Ir para Minha Conta
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 transition-colors">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Resumo do Pedido */}
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              Resumo do Pedido
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Verifique os detalhes do seu sistema antes de concluir.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl text-primary shrink-0">
              <Package size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="text-2xl font-extrabold text-primary">
                {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
          </div>

          {clientProfile && (
            <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 text-xs space-y-1">
              <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Building2 size={14} /> Dados de Faturamento B2B Vinculados:
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Razão Social:</strong> {companyName}{" "}
                {clientProfile.document ? `• CNPJ/CPF: ${clientProfile.document}` : ""}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <ShieldCheck className="text-green-500" size={20} />
              Compra 100% Segura e Criptografada
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <CreditCard className="text-blue-500" size={20} />
              Liberação Imediata após a confirmação
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Zap className="text-yellow-500" size={20} />
              Atendimento e Pós-Venda direto via WhatsApp API (UC05)
            </div>
          </div>
        </div>

        {/* Formulário e Botão com Prevenção de Duplo Clique */}
        <form
          onSubmit={handleCheckout}
          aria-busy={isLoading}
          className="w-full md:w-96 flex flex-col justify-center space-y-6 bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Pagamento Seguro
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Para essa demonstração, não pedimos cartão de crédito. Clique abaixo para gerar o pedido automaticamente no sistema.
            </p>
          </div>

          {/* Cupom de Desconto */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Tag size={16} className="text-primary" /> Cupom de Desconto
            </h3>

            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  disabled={isLoading || isCouponLoading}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="Insira o código"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isCouponLoading || isLoading || !couponCode}
                  aria-busy={isCouponLoading}
                  className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  {isCouponLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Validando...
                    </>
                  ) : (
                    "Aplicar"
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
                  <Check size={16} /> Cupom {appliedCoupon.code} aplicado!
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={removeCoupon}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
          </div>

          {/* Totais */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>
                  {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400 font-medium">
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>
                    -{" "}
                    {appliedCoupon.discountType === "PERCENTAGE"
                      ? `${appliedCoupon.discountValue}%`
                      : appliedCoupon.discountValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-gray-900 dark:text-white">Total a pagar</span>
                <span className="text-2xl font-extrabold text-primary">
                  {displayPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>

            {/* LGPD */}
            <div className="flex items-start gap-3 mb-6">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="lgpd-checkout"
                  type="checkbox"
                  disabled={isLoading}
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:opacity-50"
                />
              </div>
              <label
                htmlFor="lgpd-checkout"
                className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed"
              >
                Concordo com os{" "}
                <a
                  href="/termos"
                  target="_blank"
                  className="text-primary dark:text-blue-400 hover:underline"
                >
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a
                  href="/privacidade"
                  target="_blank"
                  className="text-primary dark:text-blue-400 hover:underline"
                >
                  Política de Privacidade
                </a>{" "}
                (LGPD).
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !lgpdConsent}
              aria-busy={isLoading}
              data-loading={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover-lift flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processando Pedido...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Confirmar Pedido
                </>
              )}
            </button>

            {isLoading && (
              <p className="text-[11px] text-center text-blue-600 dark:text-blue-400 font-semibold mt-2.5 flex items-center justify-center gap-1.5">
                <Lock size={12} /> Requisição em andamento — envio bloqueado contra duplo clique
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
