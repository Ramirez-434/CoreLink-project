import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";
import { UserCircle, ArrowLeft } from "lucide-react";

export default async function PerfilPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/minha-conta"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors py-2 min-h-[44px]"
        >
          <ArrowLeft size={16} />
          Voltar para Minha Conta Corporativa
        </Link>
      </div>

      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 flex items-center gap-4">
        <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-2xl text-primary dark:text-blue-400 shrink-0">
          <UserCircle size={32} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            Cadastro Corporativo e Fiscal
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Mantenha os dados da sua empresa atualizados para emissão de Nota Fiscal Eletrônica (NF-e) e gestão de licenças.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
