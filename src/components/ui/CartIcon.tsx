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
    <Link href="/carrinho" className="relative p-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
      <ShoppingCart size={24} />
      {mounted && totalItems > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
