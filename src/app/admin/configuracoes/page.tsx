import { getSystemSetting } from "@/actions/settings";
import { ConfiguracoesClient } from "./ConfiguracoesClient";

export const metadata = {
  title: "Configurações Gerais | CoreLink Admin",
  description: "Gerencie as preferências globais, informações da empresa e parâmetros do sistema.",
};

export default async function ConfiguracoesPage() {
  const [
    companyName,
    companyEmail,
    companyCnpj,
    maintenanceMode,
    emailNotifications,
    tourEnabled,
  ] = await Promise.all([
    getSystemSetting("company_name", "CoreLink (HJ Infor)"),
    getSystemSetting("company_email", "contato@corelink.com.br"),
    getSystemSetting("company_cnpj", "12.345.678/0001-90"),
    getSystemSetting("maintenance_mode", "false"),
    getSystemSetting("email_notifications", "true"),
    getSystemSetting("onboarding_tour_enabled", "true"),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/70 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Configurações Gerais
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              Sistema B2B
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 text-balance">
            Gerencie os dados corporativos da empresa, parâmetros de operação pública e integrações em tempo real.
          </p>
        </div>
      </div>

      {/* Painel Interativo de Configurações */}
      <ConfiguracoesClient
        initialCompany={{
          name: companyName,
          email: companyEmail,
          cnpj: companyCnpj,
        }}
        initialPreferences={{
          maintenanceMode: maintenanceMode === "true",
          emailNotifications: emailNotifications === "true",
          tourEnabled: tourEnabled === "true",
        }}
      />
    </div>
  );
}
