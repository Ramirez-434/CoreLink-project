"use client";

import { useState, useRef, useEffect } from "react";
import { updateUserProfile } from "@/actions/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Building2,
  FileText,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import {
  formatCpfCnpjMask,
  formatPhoneMask,
  validateAndSanitizeDocument,
  sanitizeTextInput,
  hasMaliciousInjection,
} from "@/lib/sanitize";

interface ProfileUser {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  document?: string | null;
  stateRegistration?: string | null;
  address?: string | null;
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const submitLockRef = useRef(false);
  const router = useRouter();

  const initialName = user.name || "";
  const initialPhone = formatPhoneMask(user.phone || "");
  const initialCompany = user.companyName || "";
  const initialDoc = formatCpfCnpjMask(user.document || "");
  const initialIe = user.stateRegistration || "";
  const initialAddress = user.address || "";

  const [name, setName] = useState<string>(initialName);
  const [phone, setPhone] = useState<string>(initialPhone);
  const [companyName, setCompanyName] = useState<string>(initialCompany);
  const [document, setDocument] = useState<string>(initialDoc);
  const [stateRegistration, setStateRegistration] = useState<string>(initialIe);
  const [address, setAddress] = useState<string>(initialAddress);
  const [cepQuery, setCepQuery] = useState<string>("");
  const [cepLoading, setCepLoading] = useState<boolean>(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [flaggedFields, setFlaggedFields] = useState<string[]>([]);

  const handleCepLookup = async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, "").slice(0, 8);
    const formatted =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCepQuery(formatted);

    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            const parts = [
              data.logradouro,
              data.bairro,
              data.localidade && data.uf
                ? `${data.localidade} - ${data.uf}`
                : data.localidade,
              `CEP ${formatted}`,
            ].filter(Boolean);
            setAddress(parts.join(", "));
            toast.success("Endereço preenchido pelo CEP! Informe o número e complemento.");
          }
        }
      } catch {
        // Fallback silencioso para digitação manual caso offline
      } finally {
        setCepLoading(false);
      }
    }
  };

  const storageKey = `corelink_profile_draft_${user.email || "default"}`;

  const isDirty =
    name !== initialName ||
    phone !== initialPhone ||
    companyName !== initialCompany ||
    document !== initialDoc ||
    stateRegistration !== initialIe ||
    address !== initialAddress;

  // Restore unsaved draft from sessionStorage on mount (protects mobile app-switching)
  useEffect(() => {
    try {
      const rawDraft = sessionStorage.getItem(storageKey);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.name === "string") setName(parsed.name);
          if (typeof parsed.phone === "string") setPhone(parsed.phone);
          if (typeof parsed.companyName === "string") setCompanyName(parsed.companyName);
          if (typeof parsed.document === "string") setDocument(parsed.document);
          if (typeof parsed.stateRegistration === "string")
            setStateRegistration(parsed.stateRegistration);
          if (typeof parsed.address === "string") setAddress(parsed.address);
          setDraftRestored(true);
        }
      }
    } catch {
      // Ignore storage access errors
    }

    // Focus deep-linked field when arriving from interactive ProfileProgressBar checklist
    try {
      const params = new URLSearchParams(window.location.search);
      const foco = params.get("foco");
      const fieldIdMap: Record<string, string> = {
        name: "profile-name",
        phone: "profile-phone",
        companyName: "profile-company",
        document: "profile-document",
        stateRegistration: "profile-ie",
        address: "profile-address",
      };
      if (foco && fieldIdMap[foco]) {
        const targetEl = window.document.getElementById(fieldIdMap[foco]) as HTMLInputElement | null;
        if (targetEl) {
          requestAnimationFrame(() => {
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
            targetEl.focus();
          });
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [storageKey]);

  // Save draft changes to sessionStorage & guard against accidental tab close
  useEffect(() => {
    try {
      if (isDirty && !savedSuccess) {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ name, phone, companyName, document, stateRegistration, address })
        );
      } else if (!isDirty) {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore storage access errors
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !savedSuccess) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    isDirty,
    savedSuccess,
    storageKey,
    name,
    phone,
    companyName,
    document,
    stateRegistration,
    address,
  ]);

  const discardDraft = () => {
    setName(initialName);
    setPhone(initialPhone);
    setCompanyName(initialCompany);
    setDocument(initialDoc);
    setStateRegistration(initialIe);
    setAddress(initialAddress);
    setDraftRestored(false);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
    toast.info("Alterações não salvas descartadas.");
  };

  const docStatus = validateAndSanitizeDocument(document);
  const isIsento = stateRegistration.trim().toUpperCase() === "ISENTO";

  // Live profile completion calculation matching ProfileProgressBar
  const liveFields = [
    { key: "name", value: name, weight: 10 },
    { key: "email", value: user.email || "ok", weight: 10 },
    { key: "phone", value: phone, weight: 15 },
    { key: "companyName", value: companyName, weight: 20 },
    { key: "document", value: document.trim() !== "" && docStatus.valid ? document : "", weight: 15 },
    { key: "stateRegistration", value: stateRegistration, weight: 15 },
    { key: "address", value: address, weight: 15 },
  ];
  const livePercentage = Math.round(
    liveFields.reduce((acc, f) => acc + (f.value && f.value.trim() !== "" ? f.weight : 0), 0)
  );

  const toggleIsento = () => {
    if (isIsento) {
      setStateRegistration("");
    } else {
      setStateRegistration("ISENTO");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitLockRef.current || isLoading) return;

    setSecurityWarning(null);
    setFlaggedFields([]);
    setSavedSuccess(false);

    const fieldChecks = [
      { key: "name", label: "Nome do Responsável", val: name },
      { key: "companyName", label: "Razão Social", val: companyName },
      { key: "stateRegistration", label: "Inscrição Estadual", val: stateRegistration },
      { key: "address", label: "Endereço Corporativo", val: address },
    ];

    const offending = fieldChecks.filter((f) => hasMaliciousInjection(f.val));
    if (offending.length > 0) {
      const names = offending.map((o) => o.label).join(", ");
      const msg = `Caracteres não permitidos detectados em: ${names}. Remova tags ou comandos especiais e tente novamente.`;
      setFlaggedFields(offending.map((o) => o.key));
      setSecurityWarning(msg);
      toast.error(msg);
      return;
    }

    if (document.trim() !== "" && !docStatus.valid) {
      toast.error(docStatus.error || "Verifique os números do CNPJ ou CPF informado.");
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
        setSavedSuccess(true);
        setDraftRestored(false);
        try {
          sessionStorage.removeItem(storageKey);
        } catch {
          // Ignore
        }
        toast.success("Dados corporativos atualizados com sucesso!");
        router.refresh();
      } else {
        setSecurityWarning(res.error || "Não foi possível validar os dados informados.");
        toast.error(res.error || "Erro ao salvar o perfil.");
      }
    } catch {
      const netMsg = "Erro de conexão ao salvar os dados. Suas alterações foram mantidas na tela.";
      setSecurityWarning(netMsg);
      toast.error(netMsg);
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-6">
      {/* Live Completion Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Status do Cadastro Fiscal
            </span>
            {(isDirty || draftRestored) && !savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/50 px-2.5 py-1 rounded-md">
                Alterações não salvas
                <button
                  type="button"
                  onClick={discardDraft}
                  className="underline hover:text-amber-950 dark:hover:text-white inline-flex items-center gap-1 ml-1 px-2 min-h-[44px]"
                >
                  <RotateCcw size={11} />
                  Descartar
                </button>
              </span>
            )}
          </div>
          <span
            className={`text-xs font-extrabold tabular-nums ${
              livePercentage === 100
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-primary dark:text-blue-400"
            }`}
          >
            {livePercentage}% preenchido
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={livePercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Porcentagem de preenchimento do formulário"
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
        >
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              livePercentage === 100 ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${livePercentage}%` }}
          />
        </div>
      </div>

      {/* Fiscal Validation Guidance */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-primary dark:text-blue-400 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
          <p className="font-bold text-gray-900 dark:text-white">
            Validação Cadastral para Emissão de Nota Fiscal Eletrônica (NF-e)
          </p>
          <p>
            O CNPJ ou CPF informado é verificado automaticamente pelo padrão oficial da Receita Federal (Módulo 11) para garantir a emissão correta das suas notas fiscais e licenças.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div
          role="status"
          className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Alterações salvas com sucesso! Seu cadastro corporativo está atualizado.</span>
          </div>
          <Link
            href="/minha-conta"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar ao Painel
          </Link>
        </div>
      )}

      {securityWarning && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-red-700 dark:text-red-300 font-semibold"
        >
          <AlertTriangle size={18} className="shrink-0" />
          <span>{securityWarning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-name"
              className="text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              Nome Completo do Responsável
            </label>
            {name.trim() === "" && (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Pendente (+10%)
              </span>
            )}
          </div>
          <input
            id="profile-name"
            name="name"
            type="text"
            autoComplete="name"
            aria-invalid={flaggedFields.includes("name")}
            value={name}
            disabled={isLoading}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            placeholder="Ex.: Carlos Mendes"
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 focus:ring-2 text-gray-900 dark:text-white disabled:opacity-60 ${
              flaggedFields.includes("name")
                ? "border-red-500 focus:ring-red-500/40"
                : "border-gray-300 dark:border-gray-700 focus:ring-primary/50"
            }`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-phone"
              className="text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              Telefone Corporativo (WhatsApp)
            </label>
            {phone.trim() === "" && (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Pendente (+15%)
              </span>
            )}
          </div>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            disabled={isLoading}
            onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
            maxLength={15}
            placeholder="(11) 99999-9999"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white font-mono disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-company"
              className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
            >
              <Building2 size={15} className="text-primary dark:text-blue-400" />
              Razão Social / Nome da Empresa
            </label>
            {companyName.trim() === "" && (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Pendente (+20%)
              </span>
            )}
          </div>
          <input
            id="profile-company"
            name="companyName"
            type="text"
            autoComplete="organization"
            aria-invalid={flaggedFields.includes("companyName")}
            value={companyName}
            disabled={isLoading}
            onChange={(e) => setCompanyName(e.target.value)}
            maxLength={120}
            placeholder="Ex.: HJ Infor Tecnologia Ltda"
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 focus:ring-2 text-gray-900 dark:text-white disabled:opacity-60 ${
              flaggedFields.includes("companyName")
                ? "border-red-500 focus:ring-red-500/40"
                : "border-gray-300 dark:border-gray-700 focus:ring-primary/50"
            }`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="profile-document"
              className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
            >
              <FileText size={15} className="text-primary dark:text-blue-400" />
              CNPJ ou CPF
            </label>
            {document.trim() === "" ? (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Pendente (+15%)
              </span>
            ) : (
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
            id="profile-document"
            name="document"
            type="text"
            inputMode="numeric"
            aria-invalid={document.trim() !== "" && !docStatus.valid}
            aria-describedby={document.trim() !== "" && !docStatus.valid ? "profile-document-error" : undefined}
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
            <p id="profile-document-error" role="alert" className="text-xs text-red-600 dark:text-red-400 font-medium">
              {docStatus.error}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="profile-ie"
              className="text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              Inscrição Estadual (IE)
            </label>
            <div className="flex items-center gap-2">
              {stateRegistration.trim() === "" && (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                  Pendente (+15%)
                </span>
              )}
              <button
                type="button"
                onClick={toggleIsento}
                aria-pressed={isIsento}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors min-h-[44px] inline-flex items-center ${
                  isIsento
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {isIsento ? "✓ Empresa Isenta de IE" : "Marcar como Isento"}
              </button>
            </div>
          </div>
          <input
            id="profile-ie"
            name="stateRegistration"
            type="text"
            inputMode={isIsento ? "text" : "numeric"}
            readOnly={isIsento}
            aria-invalid={flaggedFields.includes("stateRegistration")}
            value={stateRegistration}
            disabled={isLoading}
            onChange={(e) => {
              if (isIsento) return;
              const raw = e.target.value.toUpperCase().trim();
              setStateRegistration(raw.replace(/[^0-9.\-/]/g, "").slice(0, 18));
            }}
            maxLength={18}
            placeholder="Digite apenas os números da IE ou clique em 'Marcar como Isento'"
            className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white font-mono disabled:opacity-60 ${
              isIsento
                ? "bg-gray-100 dark:bg-gray-800 cursor-default"
                : "bg-white dark:bg-gray-900"
            }`}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="profile-address"
              className="text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              Endereço Corporativo Completo
            </label>
            <div className="flex items-center gap-2">
              {address.trim() === "" && (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                  Pendente (+15%)
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <label htmlFor="profile-cep-helper" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Buscar por CEP:
                </label>
                <input
                  id="profile-cep-helper"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={cepQuery}
                  disabled={isLoading || cepLoading}
                  onChange={(e) => handleCepLookup(e.target.value)}
                  maxLength={9}
                  placeholder="00000-000"
                  className="w-32 px-2.5 py-1.5 text-base sm:text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 min-h-[40px] sm:min-h-[36px]"
                />
              </div>
            </div>
          </div>
          <input
            id="profile-address"
            name="address"
            type="text"
            autoComplete="street-address"
            aria-invalid={flaggedFields.includes("address")}
            value={address}
            disabled={isLoading}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={200}
            placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 focus:ring-2 text-gray-900 dark:text-white disabled:opacity-60 ${
              flaggedFields.includes("address")
                ? "border-red-500 focus:ring-red-500/40"
                : "border-gray-300 dark:border-gray-700 focus:ring-primary/50"
            }`}
          />
        </div>
      </div>

      <div
        className={`pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDirty && !savedSuccess
            ? "sticky bottom-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md -mx-6 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0 sm:pb-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none"
            : ""
        }`}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Lock size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          Dados corporativos protegidos e armazenados com criptografia
        </span>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link
            href="/minha-conta"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
          >
            Voltar ao Painel
          </Link>

          <button
            type="submit"
            disabled={isLoading || (document.trim() !== "" && !docStatus.valid)}
            aria-busy={isLoading}
            className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-hover hover-lift transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2 text-sm min-h-[44px]"
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
      </div>
    </form>
  );
}
