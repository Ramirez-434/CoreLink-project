import { auth } from "@/auth";
import Link from "next/link";
import { ContatoForm } from "./ContatoForm";

export default async function ContatoPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Glowing Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <div className="container relative z-10 mx-auto px-4 py-16 max-w-3xl animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-200 text-transparent bg-clip-text animate-gradient-x">
            Fale Conosco
          </span>
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Tem alguma dúvida ou precisa de suporte? Preencha o formulário abaixo e nossa equipe entrará em contato.
        </p>

        {!isLoggedIn && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8 text-center animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Login Necessário</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Para nos enviar uma mensagem e garantir o melhor suporte, você precisa estar logado na sua conta.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors text-sm">
                Fazer Login
              </Link>
              <Link href="/cadastro" className="bg-white dark:bg-transparent text-primary dark:text-blue-400 border border-primary dark:border-blue-400 font-bold py-2 px-6 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors text-sm">
                Criar Conta
              </Link>
            </div>
          </div>
        )}

        <ContatoForm isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
