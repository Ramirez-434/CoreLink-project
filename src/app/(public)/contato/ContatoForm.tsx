"use client";

import { useState } from "react";
import { submitContactForm } from "@/actions/contact";

export function ContatoForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Você precisa ter uma conta e estar logado para enviar mensagens.");
      return;
    }

    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Erro desconhecido");
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 text-3xl">✓</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mensagem Enviada!</h3>
        <p className="text-gray-600 dark:text-gray-300">Recebemos sua mensagem e entraremos em contato em breve através do seu e-mail.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-primary dark:text-blue-400 font-bold hover:underline">
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-4 rounded-lg text-sm text-center font-medium">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="name">Nome Completo</label>
          <input required id="name" name="name" type="text" className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:border-primary dark:focus:border-blue-400" placeholder="Seu nome" disabled={!isLoggedIn} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="email">E-mail</label>
          <input required id="email" name="email" type="email" className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:border-primary dark:focus:border-blue-400" placeholder="seu@email.com" disabled={!isLoggedIn} />
        </div>
      </div>
      
      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="subject">Assunto</label>
        <input required id="subject" name="subject" type="text" className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:border-primary dark:focus:border-blue-400" placeholder="Como podemos ajudar?" disabled={!isLoggedIn} />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="message">Mensagem</label>
        <textarea required id="message" name="message" rows={5} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:border-primary dark:focus:border-blue-400 resize-none" placeholder="Escreva sua mensagem aqui..." disabled={!isLoggedIn}></textarea>
      </div>

      <div className="text-center animate-fade-in-up delay-200">
        <button 
          type="submit" 
          disabled={loading || !isLoggedIn}
          className="bg-primary text-white font-bold py-3 px-12 rounded-full hover:bg-primary-hover hover-lift transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] w-full md:w-auto relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          <span className="relative z-10">{loading ? "Enviando..." : "Enviar Mensagem"}</span>
        </button>
      </div>
    </form>
  );
}
