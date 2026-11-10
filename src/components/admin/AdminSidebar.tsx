"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Mail,
  Ticket,
  Repeat,
  Menu,
  X,
  ArrowLeft,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/assinaturas", label: "Assinaturas", icon: Repeat },
  { href: "/admin/mensagens", label: "Mensagens", icon: Mail },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({
  adminName,
  logoutAction,
}: {
  adminName: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? "bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
              }`}
            >
              <Icon size={20} className={active ? "" : "group-hover:text-primary dark:group-hover:text-blue-400"} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/60">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white flex items-center justify-center font-bold">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{adminName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 w-full text-primary dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium text-sm">Voltar ao site</span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-20 flex items-center px-8 border-b border-gray-200 dark:border-gray-700">
          <span className="font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">
            CoreLink <span className="text-primary dark:text-blue-400">Admin</span>
          </span>
        </div>
        {nav}
      </aside>

      {/* Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <span className="font-extrabold text-lg text-gray-900 dark:text-white">
          CoreLink <span className="text-primary dark:text-blue-400">Admin</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="p-2 text-gray-700 dark:text-gray-200">
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85%] bg-white dark:bg-gray-800 flex flex-col h-full shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
              <span className="font-extrabold text-lg text-gray-900 dark:text-white">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2 text-gray-700 dark:text-gray-200">
                <X size={22} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
