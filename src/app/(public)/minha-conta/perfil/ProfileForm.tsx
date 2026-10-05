"use client";

import { useState } from "react";
import { updateUserProfile } from "@/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      companyName: formData.get("companyName") as string,
      document: formData.get("document") as string,
      stateRegistration: formData.get("stateRegistration") as string,
      address: formData.get("address") as string,
    };

    const res = await updateUserProfile(data);

    if (res.success) {
      toast.success("Perfil atualizado com sucesso! 🎉");
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao salvar o perfil.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

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

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Inscrição Estadual (Opcional)</label>
          <input
            name="stateRegistration"
            defaultValue={user.stateRegistration || ""}
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
