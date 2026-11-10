import Link from "next/link";
import { Search, UserCircle, ShieldAlert, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth, signOut } from "@/auth";
import { CartIcon } from "@/components/ui/CartIcon";

export default async function Navbar() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">
            CoreLink
          </span>
          <span className="text-xs font-bold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/50">
            HJ Infor
          </span>
        </Link>

        {/* Search Bar (Centered) */}
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
          <form action="/sistemas" method="GET" className="relative flex items-center w-full">
            <Search size={16} className="absolute left-3.5 text-gray-600 dark:text-gray-300 pointer-events-none" />
            <input
              type="text"
              name="q"
              placeholder="Buscar sistemas, ERP, PDV..."
              aria-label="Buscar sistemas no catálogo"
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-300 rounded-full py-2 pl-10 pr-4 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-gray-900 border border-gray-200/60 dark:border-gray-700 transition-all text-sm"
            />
          </form>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-gray-700 dark:text-gray-300">
          <Link href="/" className="hover:text-primary dark:hover:text-blue-400 transition-colors">
            Início
          </Link>
          <Link href="/sistemas" className="hover:text-primary dark:hover:text-blue-400 transition-colors">
            Sistemas
          </Link>
          <Link href="/sobre" className="hover:text-primary dark:hover:text-blue-400 transition-colors">
            Sobre Nós
          </Link>
          <Link href="/contato" className="hover:text-primary dark:hover:text-blue-400 transition-colors">
            Contato
          </Link>
          
          <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-800 pl-5 ml-1">
            <CartIcon />
            <ThemeToggle />
            
            {!session ? (
              <Link
                href="/login"
                className="bg-primary text-white px-5 py-2.5 min-h-[44px] flex items-center justify-center rounded-full hover:bg-primary-hover transition-all shadow-sm font-bold text-sm"
              >
                Login
              </Link>
            ) : (
              <>
                {(session.user as any).role === "ADMIN" ? (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 min-h-[44px] rounded-full hover:opacity-90 transition-all font-bold shadow-sm text-sm"
                  >
                    <ShieldAlert size={16} />
                    Painel Admin
                  </Link>
                ) : (
                  <Link
                    href="/minha-conta"
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-5 py-2.5 min-h-[44px] rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold shadow-sm text-sm"
                  >
                    <UserCircle size={18} />
                    Minha Conta
                  </Link>
                )}
                <form action={async () => {
                  "use server";
                  await signOut();
                }}>
                  <button
                    type="submit"
                    aria-label="Encerrar sessão"
                    title="Encerrar sessão"
                    className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 font-bold px-3 py-2.5 min-h-[44px] rounded-full transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                  >
                    <LogOut size={16} />
                    <span className="hidden lg:inline">Sair</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Quick Actions */}
        <div className="flex items-center gap-1 md:hidden">
          <CartIcon />
          <ThemeToggle />
          <Link
            href={!session ? "/login" : (session.user as any)?.role === "ADMIN" ? "/admin/dashboard" : "/minha-conta"}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={!session ? "Fazer login" : "Acessar minha conta"}
          >
            <UserCircle size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
}
