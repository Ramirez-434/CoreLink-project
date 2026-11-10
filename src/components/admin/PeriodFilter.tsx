"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function PeriodFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("periodo") || "all";
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 bg-gray-900/70 px-3 py-1.5 rounded-xl border border-blue-500/30">
          <Loader2 size={14} className="animate-spin" />
          Atualizando...
        </span>
      )}
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => {
          const v = e.target.value;
          startTransition(() => {
            router.push(v === "all" ? "/admin/dashboard" : `/admin/dashboard?periodo=${v}`);
          });
        }}
        aria-busy={isPending}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
      >
        <option value="all">Todos os Tempos</option>
        <option value="7">Últimos 7 dias</option>
        <option value="30">Últimos 30 dias</option>
      </select>
    </div>
  );
}
