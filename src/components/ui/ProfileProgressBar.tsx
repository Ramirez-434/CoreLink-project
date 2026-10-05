import Link from "next/link";
import { User } from "@prisma/client";

export function ProfileProgressBar({ user }: { user: User }) {
  // Calculate completion percentage
  const fields = [
    { name: "name", value: user.name, weight: 10 },
    { name: "email", value: user.email, weight: 10 },
    { name: "phone", value: user.phone, weight: 15 },
    { name: "companyName", value: user.companyName, weight: 20 },
    { name: "document", value: user.document, weight: 15 },
    { name: "stateRegistration", value: user.stateRegistration, weight: 15 },
    { name: "address", value: user.address, weight: 15 },
  ];

  const totalWeight = fields.reduce((acc, field) => acc + field.weight, 0);
  const currentWeight = fields.reduce((acc, field) => {
    return acc + (field.value && field.value.trim() !== "" ? field.weight : 0);
  }, 0);

  const percentage = Math.round((currentWeight / totalWeight) * 100);

  if (percentage === 100) return null; // Don't show if complete

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-blue-100 dark:border-gray-700 rounded-2xl p-6 mb-8 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white/40 dark:from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Complete seu Perfil</h3>
            <span className="text-primary dark:text-blue-400 font-extrabold">{percentage}%</span>
          </div>
          
          <div className="w-full bg-blue-200/50 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adicione o <strong className="text-gray-900 dark:text-gray-300">CNPJ</strong> e <strong className="text-gray-900 dark:text-gray-300">Nome da Empresa</strong> para emissão de notas.
          </p>
        </div>
        
        <Link 
          href="/minha-conta/perfil" 
          className="shrink-0 bg-white dark:bg-gray-900 text-primary dark:text-blue-400 border border-blue-200 dark:border-gray-600 font-bold py-2.5 px-6 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          Editar Perfil
        </Link>
      </div>
    </div>
  );
}
