import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";
import { UserCircle } from "lucide-react";

export default async function PerfilPage() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8 flex items-center gap-4">
        <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full text-primary dark:text-blue-400">
          <UserCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Meu Perfil</h1>
          <p className="text-gray-500 dark:text-gray-400">Mantenha seus dados atualizados.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
