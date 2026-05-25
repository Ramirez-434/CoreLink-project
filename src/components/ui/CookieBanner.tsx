"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou
    const consent = localStorage.getItem("lgpd_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("lgpd_cookie_consent", "all");
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("lgpd_cookie_consent", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-fade-in-up pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-4 items-start">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 p-3 rounded-full shrink-0">
            <Cookie size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Nós respeitamos sua privacidade</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Utilizamos cookies e tecnologias semelhantes para melhorar a sua experiência em nossa plataforma, de acordo com a nossa{" "}
              <Link href="/privacidade" className="text-primary dark:text-blue-400 hover:underline font-medium">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
          <button 
            onClick={handleAcceptEssential}
            className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors whitespace-nowrap"
          >
            Apenas Essenciais
          </button>
          <button 
            onClick={handleAcceptAll}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-xl transition-colors shadow-md whitespace-nowrap hover-lift"
          >
            Aceitar Todos
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
