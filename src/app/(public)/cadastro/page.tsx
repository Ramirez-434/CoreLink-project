"use client";

import { useState, useEffect } from "react";
import { registerUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  // Phone Mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    setPhone(value);
  };

  // Real-time email validation
  useEffect(() => {
    if (email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Digite um e-mail válido.");
    } else {
      setEmailError("");
    }
  }, [email]);

  // Password Strength Logic
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 5
  };

  const strength = getPasswordStrength();
  let strengthColor = "bg-gray-200";
  let strengthText = "Muito fraca";
  if (strength >= 2) { strengthColor = "bg-red-400"; strengthText = "Fraca"; }
  if (strength >= 3) { strengthColor = "bg-yellow-400"; strengthText = "Média"; }
  if (strength >= 4) { strengthColor = "bg-green-400"; strengthText = "Forte"; }
  if (strength === 5) { strengthColor = "bg-green-600"; strengthText = "Muito Forte"; }

  useEffect(() => {
    if (password.length > 0 && password.length < 6) {
      setPassError("A senha deve ter pelo menos 6 caracteres.");
    } else {
      setPassError("");
    }
  }, [password]);

  const isFormValid = name.length > 0 && emailError === "" && passError === "" && password.length >= 6 && phone.length >= 14 && lgpdConsent;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);

    const res = await registerUser(formData);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      router.push("/login?registered=true");
    }
  }

  const handleGoogleLogin = () => {
    alert("O login social com Google será configurado em breve nas credenciais do servidor!");
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 -left-12 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/4 -right-12 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 animate-fade-in-up border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Junte-se à <span className="font-bold text-primary dark:text-blue-400">HJ Infor</span> e transforme sua gestão.
          </p>
        </div>
        
        {/* Social Login Button */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Cadastrar com o Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Ou crie com seu e-mail</span>
          </div>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-xl text-center text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nome Completo</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">E-mail</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`mt-1 w-full px-4 py-3 rounded-xl border ${emailError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400'} bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-all text-gray-800 dark:text-white`}
              required
            />
            {emailError && <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">{emailError}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Telefone (WhatsApp)</label>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 90000-0000"
              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400 transition-all text-gray-800 dark:text-white"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Senha</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                className={`w-full px-4 py-3 rounded-xl border ${passError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-primary/50 focus:border-primary dark:focus:border-blue-400'} bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 transition-all text-gray-800 dark:text-white pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 flex gap-1 h-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level} 
                      className={`flex-1 rounded-full transition-all duration-300 ${strength >= level ? strengthColor : 'bg-gray-200'}`}
                    ></div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap min-w-[60px] text-right">
                  {strengthText}
                </span>
              </div>
            )}
            {passError && <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">{passError}</p>}
          </div>

          {/* LGPD Consent Checkbox */}
          <div className="flex items-start gap-3 mt-4">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="lgpd"
                name="lgpd"
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                required
              />
            </div>
            <label htmlFor="lgpd" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
              Li e concordo com os <Link href="/termos" target="_blank" className="text-primary dark:text-blue-400 hover:underline">Termos de Uso</Link> e a <Link href="/privacidade" target="_blank" className="text-primary dark:text-blue-400 hover:underline">Política de Privacidade</Link> referentes ao tratamento dos meus dados pessoais (LGPD).
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-hover hover-lift focus:outline-none shadow-[0_0_15px_rgba(37,99,235,0.4)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              {loading ? "Criando sua conta..." : "Criar minha conta"}
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Já possui uma conta?{" "}
            <Link href="/login" className="font-bold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
