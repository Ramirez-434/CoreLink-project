"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Building2,
  Mail,
  FileText,
  Wrench,
  Bell,
  Sparkles,
  Trash2,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import {
  saveCompanySettings,
  toggleSystemSetting,
  clearSystemCache,
} from "@/actions/settings";

interface ConfiguracoesClientProps {
  initialCompany: {
    name: string;
    email: string;
    cnpj: string;
  };
  initialPreferences: {
    maintenanceMode: boolean;
    emailNotifications: boolean;
    tourEnabled: boolean;
  };
}

export function ConfiguracoesClient({
  initialCompany,
  initialPreferences,
}: ConfiguracoesClientProps) {
  // Estado das Informações da Empresa
  const [companyName, setCompanyName] = useState(initialCompany.name);
  const [companyEmail, setCompanyEmail] = useState(initialCompany.email);
  const [companyCnpj, setCompanyCnpj] = useState(initialCompany.cnpj);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Estados das Preferências
  const [maintenance, setMaintenance] = useState(initialPreferences.maintenanceMode);
  const [notifications, setNotifications] = useState(initialPreferences.emailNotifications);
  const [tour, setTour] = useState(initialPreferences.tourEnabled);

  // Estados de Transição e Bloqueio
  const [isPending, startTransition] = useTransition();
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Salvar Informações da Empresa
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingCompany) return;

    setIsSavingCompany(true);
    const toastId = toast.loading("Salvando dados da empresa no PostgreSQL...");

    try {
      const res = await saveCompanySettings({
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim(),
        companyCnpj: companyCnpj.trim(),
      });

      if (res.success) {
        toast.success("Informações da empresa salvas com sucesso!", {
          id: toastId,
          description: "Os dados foram atualizados nos comprovantes e no catálogo B2B.",
        });
      } else {
        toast.error(res.error || "Falha ao salvar informações.", { id: toastId });
      }
    } catch {
      toast.error("Erro inesperado de comunicação com o servidor.", { id: toastId });
    } finally {
      setIsSavingCompany(false);
    }
  };

  // Alternar Preferência Individual
  const handleTogglePreference = (
    key: "maintenance_mode" | "email_notifications" | "onboarding_tour_enabled",
    currentVal: boolean,
    setter: (val: boolean) => void,
    label: string
  ) => {
    const nextVal = !currentVal;
    setter(nextVal);

    startTransition(async () => {
      const res = await toggleSystemSetting(key, nextVal ? "true" : "false");
      if (res.success) {
        toast.success(
          nextVal ? `${label} ativado com sucesso.` : `${label} desativado com sucesso.`
        );
      } else {
        setter(currentVal); // reverte em caso de falha
        toast.error(res.error || `Não foi possível alterar ${label}.`);
      }
    });
  };

  // Limpar Cache
  const handleClearCache = async () => {
    if (isClearingCache) return;
    setIsClearingCache(true);
    const toastId = toast.loading("Revalidando rotas e limpando cache Next.js...");

    try {
      const res = await clearSystemCache();
      if (res.success) {
        toast.success("Cache do sistema limpo com sucesso!", {
          id: toastId,
          description: "Todas as rotas públicas e administrativas foram revalidadas.",
        });
      } else {
        toast.error(res.error || "Falha ao limpar cache.", { id: toastId });
      }
    } catch {
      toast.error("Erro ao solicitar limpeza do cache.", { id: toastId });
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
      {/* Sessão 1: Informações da Empresa */}
      <section className="p-6 md:p-8" aria-labelledby="section-company-title">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h2 id="section-company-title" className="text-lg font-bold text-gray-900 dark:text-white">
              Informações da Empresa
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-balance">
              Identificação comercial da operadora exibida em relatórios, termos e cabeçalhos B2B.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCompany}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="company-name"
                className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"
              >
                <Building2 size={14} className="text-gray-400" />
                Nome Fantasia
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: CoreLink (HJ Infor)"
                required
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="company-email"
                className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"
              >
                <Mail size={14} className="text-gray-400" />
                E-mail de Contato Principal
              </label>
              <input
                id="company-email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="contato@corelink.com.br"
                required
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="company-cnpj"
                className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"
              >
                <FileText size={14} className="text-gray-400" />
                CNPJ
              </label>
              <input
                id="company-cnpj"
                type="text"
                value={companyCnpj}
                onChange={(e) => setCompanyCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm tabular-nums transition-colors"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="submit"
              disabled={isSavingCompany}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingCompany ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando Alterações...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Salvar Informações
                </>
              )}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              Persistido com segurança via Prisma ORM no PostgreSQL.
            </span>
          </div>
        </form>
      </section>

      {/* Sessão 2: Preferências do Sistema */}
      <section className="p-6 md:p-8" aria-labelledby="section-preferences-title">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Wrench size={20} />
          </div>
          <div>
            <h2 id="section-preferences-title" className="text-lg font-bold text-gray-900 dark:text-white">
              Preferências do Sistema
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-balance">
              Controle imediato sobre a operação pública, alertas e a experiência dos clientes.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {/* Item 1: Modo de Manutenção */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4.5 first:pt-0 last:pb-0 transition-colors">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />
                <h3 id="label-maintenance" className="font-bold text-sm text-gray-900 dark:text-white">
                  Modo de Manutenção
                </h3>
              </div>
              <p id="desc-maintenance" className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-balance">
                Bloqueia o acesso público ao catálogo e checkout, exibindo aviso institucional de manutenção.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] self-start sm:self-auto shrink-0">
              <input
                type="checkbox"
                checked={maintenance}
                onChange={() =>
                  handleTogglePreference(
                    "maintenance_mode",
                    maintenance,
                    setMaintenance,
                    "Modo de Manutenção"
                  )
                }
                disabled={isPending}
                aria-labelledby="label-maintenance"
                aria-describedby="desc-maintenance"
                className="sr-only peer"
              />
              <div
                className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
                  maintenance
                    ? "peer-checked:after:translate-x-5 peer-checked:after:border-white peer-checked:bg-primary"
                    : "dark:bg-gray-700"
                } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
              ></div>
            </label>
          </div>

          {/* Item 2: Notificações por E-mail */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4.5 first:pt-0 last:pb-0 transition-colors">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-500 dark:text-blue-400 shrink-0" />
                <h3 id="label-notifications" className="font-bold text-sm text-gray-900 dark:text-white">
                  Notificações por E-mail
                </h3>
              </div>
              <p id="desc-notifications" className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-balance">
                Receba alertas operacionais imediatos a cada novo pedido realizado ou mensagem recebida no Fale Conosco.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] self-start sm:self-auto shrink-0">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() =>
                  handleTogglePreference(
                    "email_notifications",
                    notifications,
                    setNotifications,
                    "Notificações por E-mail"
                  )
                }
                disabled={isPending}
                aria-labelledby="label-notifications"
                aria-describedby="desc-notifications"
                className="sr-only peer"
              />
              <div
                className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
                  notifications
                    ? "peer-checked:after:translate-x-5 peer-checked:after:border-white peer-checked:bg-primary"
                    : "dark:bg-gray-700"
                } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
              ></div>
            </label>
          </div>

          {/* Item 3: Tour de Boas-Vindas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4.5 first:pt-0 last:pb-0 transition-colors">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                <h3 id="label-tour" className="font-bold text-sm text-gray-900 dark:text-white">
                  Tour de Boas-Vindas (Onboarding)
                </h3>
              </div>
              <p id="desc-tour" className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-balance">
                Ativa ou desativa o guia visual flutuante com checklist interativo para novos clientes corporativos no primeiro acesso.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] self-start sm:self-auto shrink-0">
              <input
                type="checkbox"
                checked={tour}
                onChange={() =>
                  handleTogglePreference(
                    "onboarding_tour_enabled",
                    tour,
                    setTour,
                    "Tour de Boas-Vindas"
                  )
                }
                disabled={isPending}
                aria-labelledby="label-tour"
                aria-describedby="desc-tour"
                className="sr-only peer"
              />
              <div
                className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
                  tour
                    ? "peer-checked:after:translate-x-5 peer-checked:after:border-white peer-checked:bg-primary"
                    : "dark:bg-gray-700"
                } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
              ></div>
            </label>
          </div>
        </div>
      </section>

      {/* Sessão 3: Zona de Perigo */}
      <section className="p-6 md:p-8 bg-red-50/40 dark:bg-red-950/20" aria-labelledby="section-danger-title">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 id="section-danger-title" className="text-lg font-bold text-red-600 dark:text-red-400">
              Zona de Manutenção e Cache
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-balance">
              Ações de infraestrutura com impacto global na renderização e revalidação do catálogo.
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 mb-6">
          Ao revalidar o cache, todas as páginas estáticas e layouts em memória serão forçados a buscar dados recentes no banco de dados.
        </p>

        <button
          type="button"
          onClick={handleClearCache}
          disabled={isClearingCache}
          className="border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isClearingCache ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Limpando Cache...
            </>
          ) : (
            <>
              <Trash2 size={16} />
              Limpar Cache do Sistema
            </>
          )}
        </button>
      </section>
    </div>
  );
}

