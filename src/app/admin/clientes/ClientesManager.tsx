"use client";

import { useState } from "react";
import { Search, MoreVertical, FileText, User, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { updateUserRole } from "@/actions/user";

type UserType = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CUSTOMER" | "EMPLOYEE";
  createdAt: Date;
};

export function ClientesManager({ initialUsers }: { initialUsers: UserType[] }) {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const csv = [
      ["ID", "Nome", "E-mail", "Telefone", "Data Cadastro", "Permissão"],
      ...users.map(u => [u.id, u.name, u.email, u.phone || "", u.createdAt.toISOString().split("T")[0], u.role])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "clientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRoleChange = async (id: string, newRole: "ADMIN" | "CUSTOMER") => {
    if (window.confirm(`Tem certeza que deseja mudar a permissão deste usuário para ${newRole}?`)) {
      const res = await updateUserRole(id, newRole);
      if (res.success) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      } else {
        alert(res.error);
      }
    }
    setOpenDropdown(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Clientes</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            Exportar CSV
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover-lift flex items-center justify-center w-full sm:w-auto">
            + Adicionar Manual
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse relative">
              <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Nome</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">E-mail</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Telefone</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Data Cadastro</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Permissão</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {user.phone ? (
                        <div className="flex items-center gap-2">
                          {user.phone}
                          <a 
                            href={`https://wa.me/55${user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${user.name.split(' ')[0]}, somos da CoreLink! Tudo bem?`)}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="text-green-500 hover:text-green-600 transition-colors"
                            title="Conversar no WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          </a>
                        </div>
                      ) : "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === "ADMIN" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" :
                        "bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-center relative">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openDropdown === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                          <div className="absolute right-10 top-10 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 py-2 animate-fade-in-up">
                            <Link 
                              href={`/admin/clientes/${user.id}`}
                              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-white transition-colors flex items-center gap-2"
                            >
                              <User size={16} /> Ver Perfil
                            </Link>
                            {user.role === "CUSTOMER" ? (
                              <button 
                                onClick={() => handleRoleChange(user.id, "ADMIN")}
                                className="w-full text-left px-4 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-gray-700 hover:text-yellow-700 transition-colors flex items-center gap-2"
                              >
                                <ShieldAlert size={16} /> Tornar Admin
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRoleChange(user.id, "CUSTOMER")}
                                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                              >
                                <User size={16} /> Tornar Cliente
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
