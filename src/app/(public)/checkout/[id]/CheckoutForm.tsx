"use client";

import { useState } from "react";
import { createOrder } from "@/actions/order";
import { useRouter } from "next/navigation";
import { Package, ShieldCheck, CreditCard, Tag, Check, X, Zap } from "lucide-react";
import { validateCoupon } from "@/actions/coupon";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

export function CheckoutForm({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const router = useRouter();

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError("");

    const res = await validateCoupon(couponCode);
    if (res.valid) {
      setAppliedCoupon(res.coupon);
      toast.success(`Cupom "${res.coupon.code}" aplicado com sucesso! 🎉`);
    } else {
      setCouponError(res.error || "Cupom inválido");
      setAppliedCoupon(null);
      toast.error(res.error || "Cupom inválido ou expirado.");
    }
    setValidatingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.info("Cupom removido.");
  };

  const finalPrice = appliedCoupon ? (
    appliedCoupon.discountType === "PERCENTAGE"
      ? product.price - (product.price * (appliedCoupon.discountValue / 100))
      : product.price - appliedCoupon.discountValue
  ) : product.price;

  const displayPrice = finalPrice < 0 ? 0 : finalPrice;

  const handleCheckout = async () => {
    setLoading(true);

    const toastId = toast.loading("Processando seu pedido...");

    const res = await createOrder(product.id, appliedCoupon?.id);

    if (res.success) {
      toast.success("Pedido realizado com sucesso! Redirecionando...", {
        id: toastId,
        description: `Seu sistema "${product.name}" foi registrado. Acesse Minha Conta para acompanhar.`,
        duration: 4000,
      });
      setTimeout(() => router.push("/minha-conta?sucesso=true"), 1500);
    } else {
      toast.error("Erro ao processar pedido.", {
        id: toastId,
        description: res.error || "Ocorreu um erro inesperado. Tente novamente.",
        duration: 6000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 transition-colors">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Resumo do Pedido */}
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Resumo do Pedido</h2>
            <p className="text-gray-500 dark:text-gray-400">Verifique os detalhes do seu sistema antes de concluir.</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl text-primary shrink-0">
              <Package size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{product.description}</p>
              <div className="text-2xl font-extrabold text-primary">
                {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
          </div>

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
              Suporte técnico incluso no plano
            </div>
          </div>
        </div>

        {/* Formulário e Botão */}
        <div className="w-full md:w-96 flex flex-col justify-center space-y-6 bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pagamento Seguro</h3>
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
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Insira o código"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode}
                  className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {validatingCoupon ? "..." : "Aplicar"}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
                  <Check size={16} /> Cupom {appliedCoupon.code} aplicado!
                </div>
                <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
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
                <span>{product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400 font-medium">
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>- {appliedCoupon.discountType === "PERCENTAGE" ? `${appliedCoupon.discountValue}%` : appliedCoupon.discountValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
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
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                />
              </div>
              <label htmlFor="lgpd-checkout" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
                Concordo com os{" "}
                <a href="/termos" target="_blank" className="text-primary dark:text-blue-400 hover:underline">Termos de Uso</a>{" "}
                e a{" "}
                <a href="/privacidade" target="_blank" className="text-primary dark:text-blue-400 hover:underline">Política de Privacidade</a>{" "}
                (LGPD).
              </label>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !lgpdConsent}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover-lift flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Confirmar Pedido
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
