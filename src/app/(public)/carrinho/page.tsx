"use client";

import { useCart } from "@/components/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle, Loader2, Zap } from "lucide-react";
import { useState, useRef, useSyncExternalStore } from "react";
import { buildCommercialWhatsAppUrl } from "@/lib/whatsapp";

const emptySubscribe = () => () => {};

export default function CarrinhoPage() {
  const { items, removeFromCart, totalItems } = useCart();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isLoading, setIsLoading] = useState(false);
  const checkoutNavLockRef = useRef(false);
  const router = useRouter();

  if (!mounted) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToCheckout = (targetProductId?: string) => {
    const productId = targetProductId || items[0]?.id;
    if (checkoutNavLockRef.current || isLoading || !productId) return;
    checkoutNavLockRef.current = true;
    setIsLoading(true);
    router.push(`/checkout/${productId}`);
  };

  const cartFingerprint = items
    .map((i) => `${i.id.slice(0, 3)}${i.quantity}`)
    .join("")
    .toUpperCase()
    .slice(0, 6);

  const whatsappCartUrl =
    items.length > 0
      ? buildCommercialWhatsAppUrl({
          orderId: `CART-${cartFingerprint || "B2B"}`,
          companyName: "Empresa Cliente (Cotação B2B via Carrinho)",
          softwares: items.map((item) => ({
            softwareName: item.name,
            quantity: item.quantity,
            totalAmount: item.price * item.quantity,
          })),
          totalValue: totalAmount,
          context: "CHECKOUT",
        })
      : "";

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[70vh]">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
        Seu Carrinho B2B
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-6">Seu carrinho está vazio.</p>
          <Link
            href="/sistemas"
            className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-hover transition-colors font-bold inline-block"
          >
            Ver Sistemas
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4"
              >
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Qtd: {item.quantity} licença(s)
                  </p>
                  {items.length > 1 && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleProceedToCheckout(item.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-blue-400 hover:underline disabled:opacity-50"
                    >
                      <Zap size={13} />
                      Checkout individual desta licença
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-extrabold text-primary tabular-nums">
                    {(item.price * item.quantity).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    aria-label={`Remover ${item.name} do carrinho`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 h-fit space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Resumo</h3>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Licenças ({totalItems})</span>
                <span className="tabular-nums">
                  {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-lg text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary tabular-nums">
                  {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleProceedToCheckout(items[0]?.id)}
              disabled={isLoading}
              aria-busy={isLoading}
              data-loading={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-4 rounded-xl text-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover-lift flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Redirecionando ao Checkout...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  {items.length === 1 ? "Finalizar Compra Online" : "Checkout do 1º Sistema"}
                </>
              )}
            </button>

            <a
              href={whatsappCartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 text-xs shadow-sm"
            >
              <MessageCircle size={16} />
              Fechar Lote B2B via WhatsApp (UC05)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
