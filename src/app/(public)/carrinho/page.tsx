"use client";

import { useCart } from "@/components/CartContext";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function CarrinhoPage() {
  const { items, removeFromCart, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[70vh]">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
        Seu Carrinho
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-6">Seu carrinho está vazio.</p>
          <Link href="/sistemas" className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-hover transition-colors font-bold inline-block">
            Ver Sistemas
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qtd: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-extrabold text-primary">
                    {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Resumo</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Itens ({totalItems})</span>
                <span>{totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
              <div className="flex justify-between font-extrabold text-lg text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary">{totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            </div>

            {items.length === 1 ? (
              <Link href={`/checkout/${items[0].id}`} className="block w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl text-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover-lift">
                Finalizar Compra
              </Link>
            ) : (
              <button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed">
                Checkout Multi-produto (Em breve)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
