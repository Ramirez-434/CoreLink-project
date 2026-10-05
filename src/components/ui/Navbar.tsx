import Link from "next/link";
import { Search, UserCircle, ShieldAlert, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth, signOut } from "@/auth";
import { CartIcon } from "@/components/ui/CartIcon";

export default async function Navbar() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">
            HJ Infor
          </span>
        </Link>

        {/* Search Bar (Centered) */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <div className="relative flex items-center w-full max-w-sm">
            <input
              type="text"
              placeholder="buscar"
              className="w-full bg-primary text-white placeholder-white/80 rounded-full py-2 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-hover shadow-sm"
            />
            <div className="absolute right-1 top-1 bottom-1 w-8 bg-white rounded-full flex items-center justify-center text-primary cursor-pointer hover:bg-gray-100 transition-colors">
              <Search size={16} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-800 dark:text-gray-300">
          <Link href="/" className="hover:text-primary dark:hover:text-blue-400 transition-colors">home</Link>
          <Link href="/sistemas" className="hover:text-primary dark:hover:text-blue-400 transition-colors">sistemas</Link>
          <Link href="/sobre" className="hover:text-primary dark:hover:text-blue-400 transition-colors">sobre</Link>
          <Link href="/contato" className="hover:text-primary dark:hover:text-blue-400 transition-colors">contato</Link>
          
          <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-800 pl-6 ml-2">
            <CartIcon />
            <ThemeToggle />
            
            {!session ? (
              <Link href="/login" className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primary-hover hover-lift transition-all shadow-sm font-bold">
                Login
              </Link>
            ) : (
              <>
                {(session.user as any).role === "ADMIN" ? (
                  <Link href="/admin/dashboard" className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full hover:opacity-90 transition-all font-bold shadow-sm hover-lift">
                    <ShieldAlert size={16} />
                    Admin
                  </Link>
                ) : (
                  <Link href="/minha-conta" className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-5 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold shadow-sm hover-lift">
                    <UserCircle size={18} />
                    Minha Conta
                  </Link>
                )}
                <form action={async () => {
                  "use server";
                  await signOut();
                }}>
                  <button type="submit" className="flex items-center gap-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 font-bold px-3 py-2 rounded-full transition-colors hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={18} />
                    <span className="hidden lg:inline">Sair</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
