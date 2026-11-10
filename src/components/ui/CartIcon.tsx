"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartIcon() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/carrinho"
      aria-label={totalItems > 0 ? `Ver carrinho com ${totalItems} item(ns)` : "Ver carrinho de compras"}
      className="relative p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <ShoppingCart size={22} />
      {mounted && totalItems > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full tabular-nums shadow-sm min-w-[18px]">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
