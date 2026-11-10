"use client";

import { useCart } from "@/components/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle, Loader2, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { buildCommercialWhatsAppUrl } from "@/lib/whatsapp";

export default function CarrinhoPage() {
  const { items, removeFromCart, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const checkoutNavLockRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (checkoutNavLockRef.current || isLoading || items.length === 0) return;
    checkoutNavLockRef.current = true;
    setIsLoading(true);
    router.push(`/checkout/${items[0].id}`);
  };

  const whatsappCartUrl =
    items.length > 0
      ? buildCommercialWhatsAppUrl({
          orderId: `CART-${Date.now().toString(36).toUpperCase().slice(-6)}`,
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
                className="flex items-center justify-between p-6 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800"
              >
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Qtd: {item.quantity} licença(s)
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-extrabold text-primary">
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
                <span>
                  {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-lg text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary">
                  {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>

            {items.length === 1 && (
              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isLoading}
                aria-busy={isLoading}
                data-loading={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl text-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover-lift flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Redirecionando ao Checkout...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Finalizar Compra Online
                  </>
                )}
              </button>
            )}

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
