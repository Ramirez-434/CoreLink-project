"use client";

import { useState } from "react";
import { updateUserProfile } from "@/actions/user";
import { useRouter } from "next/navigation";

export function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      companyName: formData.get("companyName") as string,
      document: formData.get("document") as string,
      address: formData.get("address") as string,
    };

    const res = await updateUserProfile(data);

    if (res.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || "Erro ao salvar o perfil.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl font-bold">
          Perfil atualizado com sucesso!
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nome Completo</label>
          <input
            name="name"
            defaultValue={user.name || ""}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Telefone (WhatsApp)</label>
          <input
            name="phone"
            defaultValue={user.phone || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nome da Empresa</label>
          <input
            name="companyName"
            defaultValue={user.companyName || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">CNPJ ou CPF</label>
          <input
            name="document"
            defaultValue={user.document || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Endereço Completo</label>
          <input
            name="address"
            defaultValue={user.address || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-hover hover-lift transition-all shadow-md disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
