"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Credenciais inválidas. Tente novamente.");
    } else {
      const session = await getSession();
      if (session?.user && (session.user as any).role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 -left-12 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/4 -right-12 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl relative z-10 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Login</h1>
        
        {error && <p className="text-red-500 text-center mb-4 text-sm font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white"
            required
          />
          
          <div className="w-full text-left pl-2">
            <Link href="#" className="text-sm font-semibold text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors">
              esqueceu a senha?
            </Link>
          </div>

          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-200 text-transparent bg-clip-text animate-gradient-x">
                Acessar Painel
              </span>
            </h2>
          </div>
          
          <div className="pt-4 w-full flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-semibold py-3 px-12 rounded-full hover:bg-primary-hover transition-colors shadow-md w-3/4 hover-lift disabled:opacity-50"
            >
              {loading ? "Aguarde..." : "Entrar"}
            </button>
            <Link
              href="/cadastro"
              className="bg-primary text-white text-center font-semibold py-3 px-12 rounded-full hover:bg-primary-hover transition-colors shadow-md w-3/4 hover-lift"
            >
              Cadastrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
