"use client";

import { HelpCircle } from "lucide-react";

export function WelcomeTourButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("start-onboarding-tour"))}
      className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-white dark:bg-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors min-h-[44px]"
    >
      <HelpCircle size={15} className="shrink-0" />
      Fazer tour guiado (3 passos)
    </button>
  );
}

