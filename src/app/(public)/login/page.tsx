"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { HJ_INFOR_COMMERCIAL_WHATSAPP } from "@/lib/whatsapp";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const normalizedEmail = ((formData.get("email") as string) || "").trim().toLowerCase();
      const password = formData.get("password") as string;

      const res = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
      });

      setLoading(false);

      if (res?.error) {
        setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
      } else {
        const session = await getSession();
        if (session?.user && (session.user as { role?: string }).role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/minha-conta");
        }
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Falha de conexão com o servidor. Verifique sua internet e tente novamente.");
    }
  }

  const handleRecoverySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Informe um e-mail corporativo válido para recuperar seu acesso.");
      return;
    }
    setError(null);
    setRecoverySent(true);
  };

  const whatsappRecoveryUrl = `https://api.whatsapp.com/send?phone=${HJ_INFOR_COMMERCIAL_WHATSAPP.replace(
    /\D/g,
    ""
  )}&text=${encodeURIComponent(
    `*[HJ INFOR — RECUPERAÇÃO DE ACESSO CORPORATIVO]*\n\nOlá! Preciso redefinir a senha de acesso ao painel CoreLink para o e-mail: *${
      email.trim() || "não informado"
    }*.`
  )}`;

  if (showRecovery) {
    return (
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 animate-fade-in-up border border-gray-100 dark:border-gray-700">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setShowRecovery(false);
              setRecoverySent(false);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-blue-400 transition-colors min-h-[44px] px-1"
          >
            <ArrowLeft size={14} />
            Voltar para o login
          </button>
          <div className="flex items-center gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400">
              <KeyRound size={20} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recuperar acesso
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Informe o e-mail vinculado à sua conta corporativa para receber as instruções de redefinição ou acione o suporte comercial.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3.5 rounded-xl text-center text-sm font-medium"
          >
            {error}
          </div>
        )}

        {recoverySent ? (
          <div className="space-y-4">
            <div
              role="status"
              className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-start gap-3 text-sm"
            >
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Protocolo de redefinição registrado</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                  Se <strong>{email.trim()}</strong> estiver cadastrado em nossa base corporativa, enviaremos as instruções de recuperação para sua caixa de entrada.
                </p>
              </div>
            </div>

            <a
              href={whatsappRecoveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors min-h-[44px]"
            >
              <MessageCircle size={16} />
              Agilizar liberação via WhatsApp Comercial
            </a>
          </div>
        ) : (
          <form onSubmit={handleRecoverySubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="recovery-email"
                className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                E-mail Corporativo
              </label>
              <input
                id="recovery-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                placeholder="voce@suaempresa.com.br"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-3.5 px-6 rounded-xl hover:bg-primary-hover transition-all shadow-md min-h-[44px]"
            >
              Solicitar redefinição de senha
              <ArrowRight size={16} />
            </button>

            <a
              href={whatsappRecoveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-xs font-bold py-3 px-4 rounded-xl transition-colors min-h-[44px]"
            >
              <MessageCircle size={15} className="text-emerald-600 dark:text-emerald-400" />
              Falar direto com o Suporte no WhatsApp
            </a>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 animate-fade-in-up border border-gray-100 dark:border-gray-700">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Acesse sua conta
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Gerencie suas licenças e acione o suporte corporativo da{" "}
          <span className="font-bold text-primary dark:text-blue-400">HJ Infor</span>.
        </p>
      </div>

      {isRegistered && !error && (
        <div
          role="status"
          className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-start gap-3 text-sm"
        >
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Conta criada com sucesso!</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              Entre com seu e-mail e senha abaixo para acessar o painel corporativo.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3.5 rounded-xl text-center text-sm font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
            placeholder="voce@suaempresa.com.br"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <button
              type="button"
              onClick={() => {
                setShowRecovery(true);
                setError(null);
              }}
              className="inline-flex items-center text-xs font-semibold text-primary dark:text-blue-400 hover:underline transition-colors min-h-[44px] px-1"
            >
              Esqueceu a senha? Recuperar acesso
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 w-11 min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-3.5 px-6 rounded-xl hover:bg-primary-hover transition-all shadow-md hover-lift disabled:opacity-50 min-h-[48px]"
          >
            {loading ? (
              "Entrando no painel..."
            ) : (
              <>
                Entrar na Minha Conta
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
          Ainda não possui conta?{" "}
          <Link
            href="/cadastro"
            className="font-bold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Cadastre sua empresa
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full h-96 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-10 animate-pulse" />
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
