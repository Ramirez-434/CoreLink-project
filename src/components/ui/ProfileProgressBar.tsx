"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CircleDashed,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

interface ProfileProgressUser {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  document?: string | null;
  stateRegistration?: string | null;
  address?: string | null;
}

export function ProfileProgressBar({ user }: { user: ProfileProgressUser }) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("corelink_profile_checklist_dismissed") === "true") {
        setIsDismissed(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleDismiss = (dismiss: boolean) => {
    setIsDismissed(dismiss);
    try {
      if (dismiss) {
        localStorage.setItem("corelink_profile_checklist_dismissed", "true");
      } else {
        localStorage.removeItem("corelink_profile_checklist_dismissed");
      }
    } catch {
      // Ignore storage errors
    }
  };

  // Ordered from easiest to hardest (endowed progress starts with account + email already checked)
  const fields = [
    { key: "name", label: "Conta e Responsável", value: user.name, weight: 10 },
    { key: "email", label: "E-mail Corporativo", value: user.email, weight: 10 },
    { key: "phone", label: "WhatsApp Comercial", value: user.phone, weight: 15 },
    { key: "companyName", label: "Razão Social", value: user.companyName, weight: 20 },
    { key: "document", label: "CNPJ ou CPF", value: user.document, weight: 15 },
    { key: "stateRegistration", label: "Inscrição Estadual", value: user.stateRegistration, weight: 15 },
    { key: "address", label: "Endereço Fiscal", value: user.address, weight: 15 },
  ];

  const totalWeight = fields.reduce((acc, field) => acc + field.weight, 0);
  const currentWeight = fields.reduce((acc, field) => {
    return acc + (field.value && field.value.trim() !== "" ? field.weight : 0);
  }, 0);

  const percentage = Math.round((currentWeight / totalWeight) * 100);

  if (percentage === 100) return null;

  const missingFields = fields.filter((f) => !f.value || f.value.trim() === "");
  const completedFields = fields.filter((f) => Boolean(f.value && f.value.trim() !== ""));
  const nextField = missingFields[0];

  if (isDismissed) {
    return (
      <div id="tour-perfil" className="mb-8 flex justify-end">
        <button
          type="button"
          onClick={() => handleToggleDismiss(false)}
          className="inline-flex items-center gap-2 text-xs font-bold text-primary dark:text-blue-400 bg-blue-50/80 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 border border-blue-200 dark:border-gray-700 px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
        >
          <span>
            Cadastro Fiscal ({percentage}% concluído • {missingFields.length} pendente
            {missingFields.length > 1 ? "s" : ""})
          </span>
          <ChevronDown size={15} />
        </button>
      </div>
    );
  }

  return (
    <section
      id="tour-perfil"
      aria-labelledby="profile-progress-heading"
      className="bg-blue-50/80 dark:bg-gray-800/90 border border-blue-200 dark:border-gray-700 rounded-2xl p-6 mb-8 relative"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 min-w-0 w-full space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2
              id="profile-progress-heading"
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              Checklist de Ativação Fiscal (NF-e)
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="shrink-0" />
                {completedFields.length} de {fields.length} concluídos
              </span>
              <span className="text-sm font-extrabold text-primary dark:text-blue-400 tabular-nums">
                {percentage}%
              </span>
              <button
                type="button"
                onClick={() => handleToggleDismiss(true)}
                aria-label="Ocultar checklist de cadastro fiscal"
                title="Minimizar checklist"
                className="inline-flex items-center justify-center w-9 h-9 min-h-[44px] min-w-[44px] -mr-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-blue-100/60 dark:hover:bg-gray-700/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso de preenchimento do perfil corporativo"
            className="w-full bg-blue-200/60 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden"
          >
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Clique em qualquer item pendente abaixo para preenchê-lo diretamente:
          </p>

          {/* Interactive Checklist Chips (Endowed Progress + Direct Jump Links) */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            {completedFields.slice(0, 2).map((field) => (
              <span
                key={field.key}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 min-h-[44px]"
              >
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                {field.label}
              </span>
            ))}

            {missingFields.map((field) => (
              <Link
                key={field.key}
                href={`/minha-conta/perfil?foco=${field.key}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border bg-white dark:bg-gray-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/70 hover:border-primary dark:hover:border-blue-400 hover:text-primary dark:hover:text-blue-300 transition-colors shadow-2xs min-h-[44px]"
              >
                <CircleDashed size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{field.label}</span>
                <span className="opacity-75 font-bold">(+{field.weight}%)</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
          <Link
            href={nextField ? `/minha-conta/perfil?foco=${nextField.key}` : "/minha-conta/perfil"}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-hover transition-all shadow-sm text-sm min-h-[44px]"
          >
            {nextField
              ? `Preencher ${nextField.label}`
              : `Completar ${missingFields.length} campos`}
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => handleToggleDismiss(true)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-3 min-h-[44px] rounded-xl transition-colors"
          >
            <ChevronUp size={14} />
            Fazer isso depois
          </button>
        </div>
      </div>
    </section>
  );
}
