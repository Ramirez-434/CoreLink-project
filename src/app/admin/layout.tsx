import Link from "next/link";
import { LayoutDashboard, Package, LogOut, Users, ShoppingCart, Settings } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated or not an ADMIN, redirect them to the home or their client dashboard
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-gray-200 dark:border-gray-700">
          <span className="font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">
            CoreLink Admin
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/produtos" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Package size={20} />
            <span className="font-medium">Produtos</span>
          </Link>
          <Link href="/admin/pedidos" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ShoppingCart size={20} />
            <span className="font-medium">Pedidos</span>
          </Link>
          <Link href="/admin/clientes" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Users size={20} />
            <span className="font-medium">Clientes</span>
          </Link>
          <Link href="/admin/mensagens" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="font-medium">Mensagens</span>
          </Link>
          <Link href="/admin/configuracoes" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Settings size={20} />
            <span className="font-medium">Configurações</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 w-full text-primary dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="font-medium">Voltar ao site</span>
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-gray-700 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4">
          <span className="font-extrabold text-lg text-gray-900 dark:text-white">CoreLink</span>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
