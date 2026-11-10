"use client";

import { useState, useRef } from "react";
import { updateUserProfile } from "@/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Building2,
  FileText,
} from "lucide-react";
import {
  formatCpfCnpjMask,
  formatPhoneMask,
  validateAndSanitizeDocument,
  sanitizeTextInput,
  hasMaliciousInjection,
} from "@/lib/sanitize";

export function ProfileForm({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const submitLockRef = useRef(false);
  const router = useRouter();

  const [name, setName] = useState<string>(user.name || "");
  const [phone, setPhone] = useState<string>(formatPhoneMask(user.phone || ""));
  const [companyName, setCompanyName] = useState<string>(user.companyName || "");
  const [document, setDocument] = useState<string>(formatCpfCnpjMask(user.document || ""));
  const [stateRegistration, setStateRegistration] = useState<string>(
    user.stateRegistration || ""
  );
  const [address, setAddress] = useState<string>(user.address || "");
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const docStatus = validateAndSanitizeDocument(document);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitLockRef.current || isLoading) return;

    setSecurityWarning(null);

    if (
      hasMaliciousInjection(name) ||
      hasMaliciousInjection(companyName) ||
      hasMaliciousInjection(address) ||
      hasMaliciousInjection(stateRegistration)
    ) {
      const msg =
        "Tentativa de injeção de código ou tags HTML bloqueada pelo filtro de segurança.";
      setSecurityWarning(msg);
      toast.error(msg);
      return;
    }

    if (document.trim() !== "" && !docStatus.valid) {
      toast.error(docStatus.error || "CNPJ/CPF inválido.");
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);

    try {
      const data = {
        name: sanitizeTextInput(name, 100),
        phone,
        companyName: sanitizeTextInput(companyName, 120),
        document,
        stateRegistration: stateRegistration.trim().toUpperCase(),
        address: sanitizeTextInput(address, 200),
      };

      const res = await updateUserProfile(data);

      if (res.success) {
        if (res.sanitized) {
          setName(res.sanitized.name);
          setCompanyName(res.sanitized.companyName);
          setDocument(res.sanitized.document);
          setPhone(res.sanitized.phone);
          setStateRegistration(res.sanitized.stateRegistration);
          setAddress(res.sanitized.address);
        }
        toast.success("Perfil corporativo validado e salvo com segurança! 🛡️");
        router.refresh();
      } else {
        setSecurityWarning(res.error || "Erro ao validar dados.");
        toast.error(res.error || "Erro ao salvar o perfil.");
      }
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-6">
      {/* Banner de Segurança e Sanitização Ativa */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
          <p className="font-bold text-gray-900 dark:text-white">
            Proteção Ativa contra Input Injection &amp; Validação Oficial Módulo 11 (Receita Federal)
          </p>
          <p>
            Todos os campos corporativos passam por filtragem estrita no cliente e no servidor (Zod +
            Sanitizer), bloqueando injeção de parâmetros e exigindo dígitos verificadores autênticos
            para CPF e CNPJ.
          </p>
        </div>
      </div>

      {securityWarning && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-red-700 dark:text-red-300 font-semibold">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{securityWarning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Nome Completo do Responsável
          </label>
          <input
            name="name"
            value={name}
            disabled={isLoading}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            placeholder="Ex.: Marques Ramirez"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Telefone Corporativo (WhatsApp)
          </label>
          <input
            name="phone"
            value={phone}
            disabled={isLoading}
            onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
            maxLength={15}
            placeholder="(63) 99999-9999"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white font-mono disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Building2 size={15} className="text-primary" /> Razão Social / Nome da Empresa
          </label>
          <input
            name="companyName"
            value={companyName}
            disabled={isLoading}
            onChange={(e) => setCompanyName(e.target.value)}
            maxLength={120}
            placeholder="Ex.: HJ Infor Tecnologia Ltda"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <FileText size={15} className="text-primary" /> CNPJ ou CPF
            </label>
            {document.trim() !== "" && (
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  docStatus.valid
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                }`}
              >
                {docStatus.valid ? (
                  <>
                    <CheckCircle2 size={12} /> {docStatus.type} Válido (Módulo 11)
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} /> Inválido
                  </>
                )}
              </span>
            )}
          </div>
          <input
            name="document"
            value={document}
            disabled={isLoading}
            onChange={(e) => setDocument(formatCpfCnpjMask(e.target.value))}
            maxLength={18}
            placeholder="00.000.000/0001-00 ou 000.000.000-00"
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 focus:ring-2 text-gray-900 dark:text-white font-mono disabled:opacity-60 ${
              document.trim() === ""
                ? "border-gray-300 dark:border-gray-700 focus:ring-primary/50"
                : docStatus.valid
                ? "border-emerald-500 focus:ring-emerald-500/40"
                : "border-red-500 focus:ring-red-500/40"
            }`}
          />
          {document.trim() !== "" && !docStatus.valid && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {docStatus.error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Inscrição Estadual (Apenas números ou ISENTO)
          </label>
          <input
            name="stateRegistration"
            value={stateRegistration}
            disabled={isLoading}
            onChange={(e) =>
              setStateRegistration(
                e.target.value.toUpperCase().replace(/[^0-9ISENTOA.\-/]/g, "").slice(0, 18)
              )
            }
            maxLength={18}
            placeholder="Ex.: 290123456 ou ISENTO"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white font-mono disabled:opacity-60"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Endereço Corporativo Completo
          </label>
          <input
            name="address"
            value={address}
            disabled={isLoading}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={200}
            placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Lock size={13} className="text-emerald-600" />
          Dados higienizados e normalizados antes da gravação no PostgreSQL
        </span>

        <button
          type="submit"
          disabled={isLoading || (document.trim() !== "" && !docStatus.valid)}
          aria-busy={isLoading}
          className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-hover hover-lift transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Validando e Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </button>
      </div>
    </form>
  );
}
