"use client";

import { useState } from "react";
import { registerUser } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPhoneMask } from "@/lib/sanitize";

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("Criando sua conta...");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  // Validation & Touched States (only show errors after blur, clear immediately when valid)
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passTouched, setPassTouched] = useState(false);

  const isEmailFormatValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const isPhoneLengthValid = phone.length >= 14;
  const isMinPasswordMet = password.length >= 6;

  const emailError =
    emailTouched && email.trim().length > 0 && !isEmailFormatValid
      ? "Digite um e-mail corporativo ou pessoal válido (ex.: nome@empresa.com.br)."
      : "";

  const phoneError =
    phoneTouched && phone.length > 0 && !isPhoneLengthValid
      ? "Digite o DDD + número completo com 10 ou 11 dígitos."
      : "";

  const passError =
    passTouched && password.length > 0 && !isMinPasswordMet
      ? "A senha precisa ter pelo menos 6 caracteres para continuar."
      : "";

  // Shared Phone Mask from @/lib/sanitize
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneMask(e.target.value));
  };

  // Password Strength Logic & Criteria (separating required vs. optional security tips)
  const optionalPasswordTips = [
    { label: "8+ caracteres", met: password.length >= 8 },
    { label: "Letra maiúscula", met: /[A-Z]/.test(password) },
    { label: "Número", met: /[0-9]/.test(password) },
    { label: "Símbolo (@, #, !)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = (isMinPasswordMet ? 1 : 0) + optionalPasswordTips.filter((c) => c.met).length;
  let strengthColor = "bg-gray-200 dark:bg-gray-700";
  let strengthText = "Incompleta";
  if (isMinPasswordMet && strength <= 2) {
    strengthColor = "bg-amber-500";
    strengthText = "Válida (Básica)";
  } else if (strength === 3) {
    strengthColor = "bg-blue-500";
    strengthText = "Válida (Boa)";
  } else if (strength === 4) {
    strengthColor = "bg-emerald-500";
    strengthText = "Forte";
  } else if (strength === 5) {
    strengthColor = "bg-emerald-600";
    strengthText = "Muito forte";
  }

  const isFormValid =
    name.trim().length >= 2 &&
    isEmailFormatValid &&
    isPhoneLengthValid &&
    isMinPasswordMet &&
    lgpdConsent;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setLoadingStage("Criando sua conta...");
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", normalizedEmail);
      formData.append("phone", phone);
      formData.append("password", password);

      const res = await registerUser(formData);

      if (res.error) {
        setLoading(false);
        setError(res.error);
        return;
      }

      setLoadingStage("Autenticando e preparando seu painel...");
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
      });

      setLoading(false);

      if (signInResult?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/minha-conta?welcome=true");
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Falha de conexão com o servidor. Verifique sua internet e tente novamente.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 animate-fade-in-up border border-gray-100 dark:border-gray-700">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Crie sua conta corporativa
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Configure seu acesso à <span className="font-bold text-primary dark:text-blue-400">HJ Infor</span> em menos de 1 minuto. Os dados fiscais da empresa (CNPJ e Razão Social) podem ser adicionados depois no painel.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3.5 rounded-xl text-center text-sm font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name Field */}
          <div>
            <label
              htmlFor="register-name"
              className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Nome Completo do Responsável
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Carlos Mendes"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              E-mail de Acesso
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={emailError !== ""}
              aria-describedby={emailError ? "register-email-error" : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="voce@suaempresa.com.br"
              className={`w-full px-4 py-3 rounded-xl border ${
                emailError
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 dark:border-gray-700 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400"
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-all text-gray-800 dark:text-white`}
              required
            />
            {emailError && (
              <p id="register-email-error" role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1.5">
                {emailError}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="register-phone"
                className="text-sm font-bold text-gray-700 dark:text-gray-300"
              >
                Telefone (WhatsApp Comercial)
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">DDD + número</span>
            </div>
            <input
              id="register-phone"
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={phoneError !== ""}
              aria-describedby={phoneError ? "register-phone-error" : undefined}
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => setPhoneTouched(true)}
              placeholder="(11) 99999-9999"
              className={`w-full px-4 py-3 rounded-xl border ${
                phoneError
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 dark:border-gray-700 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400"
              } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-all text-gray-800 dark:text-white font-mono`}
              required
            />
            {phoneError && (
              <p id="register-phone-error" role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1.5">
                {phoneError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="register-password"
                className="text-sm font-bold text-gray-700 dark:text-gray-300"
              >
                Senha
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">Mínimo 6 caracteres</span>
            </div>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                aria-invalid={passError !== ""}
                aria-describedby="register-password-hints"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPassTouched(true)}
                placeholder="Crie sua senha de acesso"
                className={`w-full px-4 py-3 rounded-xl border ${
                  passError
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-gray-300 dark:border-gray-700 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400"
                } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-all text-gray-800 dark:text-white pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 w-11 min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Meter & Clear Separation of Requirement vs. Optional Tips */}
            <div id="register-password-hints" className="mt-2.5 space-y-2">
              {password.length > 0 && (
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 flex gap-1 h-1.5"
                    role="progressbar"
                    aria-valuenow={strength}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label="Força da senha"
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength >= level ? strengthColor : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold whitespace-nowrap min-w-[92px] text-right">
                    {strengthText}
                  </span>
                </div>
              )}

              {isMinPasswordMet && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} className="shrink-0" />
                    Requisito mínimo de 6 caracteres atendido. Sugestões opcionais de segurança:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {optionalPasswordTips.map((tip) => (
                      <span
                        key={tip.label}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                          tip.met
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <CheckCircle2
                          size={11}
                          className={tip.met ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}
                        />
                        {tip.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {passError && (
                <p role="alert" className="text-red-600 dark:text-red-400 text-xs font-medium">
                  {passError}
                </p>
              )}
            </div>
          </div>

          {/* LGPD Consent Checkbox with 44px Touch Target */}
          <div className="flex items-start gap-2 pt-1">
            <label
              htmlFor="lgpd"
              className="flex items-center justify-center w-11 min-h-[44px] -ml-2 cursor-pointer shrink-0"
            >
              <input
                id="lgpd"
                name="lgpd"
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                required
              />
            </label>
            <label htmlFor="lgpd" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer leading-relaxed py-2">
              Li e concordo com os{" "}
              <Link href="/termos" target="_blank" className="font-semibold text-primary dark:text-blue-400 hover:underline">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" target="_blank" className="font-semibold text-primary dark:text-blue-400 hover:underline">
                Política de Privacidade
              </Link>{" "}
              referentes ao tratamento dos meus dados cadastrais (LGPD).
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              aria-busy={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-hover hover-lift focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px]"
            >
              {loading ? (
                loadingStage
              ) : (
                <>
                  Criar conta e acessar painel
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Acesso imediato ao painel corporativo após o cadastro</span>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="font-bold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Entrar na minha conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
