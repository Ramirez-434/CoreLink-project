"use client";

import { useCart } from "@/components/CartContext";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
};

export function AddToCartButton({ 
  product,
  variant = "solid",
  className = ""
}: { 
  product: Product;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price: product.price });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const baseStyle = "flex items-center justify-center gap-2 text-sm font-bold px-6 py-2.5 min-h-[44px] rounded-xl transition-all w-full shadow-sm";
  const solidStyle = "bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white";
  const outlineStyle = "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700";

  return (
    <button
      onClick={handleAdd}
      className={`${baseStyle} ${variant === "outline" ? outlineStyle : solidStyle} ${className}`}
    >
      <ShoppingCart size={16} />
      Adicionar ao Carrinho
    </button>
  );
}
