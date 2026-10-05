"use client";

import { useCart } from "@/components/CartContext";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
};

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price: product.price });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors w-full mt-2"
    >
      <ShoppingCart size={16} />
      Adicionar ao Carrinho
    </button>
  );
}
