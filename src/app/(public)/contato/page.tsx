import { auth } from "@/auth";
import Link from "next/link";
import { ContatoForm } from "./ContatoForm";

export default async function ContatoPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl animate-fade-in-up">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 text-center tracking-tight">
          Fale Conosco
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-balance text-sm sm:text-base">
          Tem alguma dúvida sobre contratação de licenças ou precisa de suporte? Nossa equipe retornará rapidamente.
        </p>

        <img
          src="/images/tech-support.jpg"
          alt="Atendimento e suporte ao cliente"
          className="w-full max-w-sm mx-auto rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 mb-8"
        />

        {!isLoggedIn && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8 text-center animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Identificação Necessária</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-5 text-sm max-w-md mx-auto text-balance">
              Para registrar seu chamado e vincular ao histórico da sua empresa, acesse sua conta corporativa.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/login"
                className="bg-primary text-white font-bold py-2.5 px-6 min-h-[44px] inline-flex items-center justify-center rounded-xl hover:bg-primary-hover shadow-sm transition-colors text-sm"
              >
                Fazer Login
              </Link>
              <Link
                href="/cadastro"
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-2.5 px-6 min-h-[44px] inline-flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors text-sm"
              >
                Cadastrar Empresa
              </Link>
            </div>
          </div>
        )}

        <ContatoForm isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
