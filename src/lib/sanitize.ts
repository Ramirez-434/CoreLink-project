/**
 * Módulo de Sanitização de Entrada, Prevenção de Input Injection (XSS / SQLi / Parameter Injection)
 * e Validação Algorítmica (Módulo 11 — Receita Federal) para CPF e CNPJ no Perfil Corporativo B2B.
 */

const INJECTION_PATTERNS: RegExp[] = [
  /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  /<\/?[a-z][^>]*>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /\bon[a-z]+\s*=/gi,
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|TRUNCATE)\b\s+\b(FROM|INTO|TABLE|ALL|SELECT|SET)\b)/gi,
  /(--|\/\*|\*\/|;\s*--)/g,
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
];

/**
 * Detecta se a string bruta contém padrões clássicos de Input Injection (XSS, HTML Tags, SQLi ou Null Bytes).
 */
export function hasMaliciousInjection(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return INJECTION_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(raw);
  });
}

/**
 * Sanitiza texto livre (Nome, Razão Social, Endereço) removendo tags HTML, vetores XSS,
 * caracteres de controle, metacaracteres de injeção e normalizando espaços.
 */
export function sanitizeTextInput(raw: string | null | undefined, maxLength = 150): string {
  if (!raw) return "";
  let cleaned = String(raw);

  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Remove delimitadores perigosos para HTML/SQL/Template Injection (<, >, `, $, {, }, ;)
  cleaned = cleaned.replace(/[<>;`\\{}]/g, "");

  // Normaliza múltiplos espaços em branco e aplica trim
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned.slice(0, maxLength);
}

/**
 * Extrai estritamente dígitos numéricos [0-9] de qualquer entrada.
 */
export function onlyDigits(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw).replace(/\D/g, "");
}

/**
 * Validação algorítmica oficial de CPF (11 dígitos + 2 Dígitos Verificadores Módulo 11).
 */
export function isValidCPF(raw: string | null | undefined): boolean {
  const digits = onlyDigits(raw);
  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas conhecidas (000.000.000-00 até 999.999.999-99)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Cálculo do 1º Dígito Verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  // Cálculo do 2º Dígito Verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(digits[10])) return false;

  return true;
}

/**
 * Validação algorítmica oficial de CNPJ (14 dígitos + 2 Dígitos Verificadores Módulo 11).
 */
export function isValidCNPJ(raw: string | null | undefined): boolean {
  const digits = onlyDigits(raw);
  if (digits.length !== 14) return false;

  // Rejeita sequências repetidas conhecidas (00.000.000/0000-00 até 99.999.999/9999-99)
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = weights.reduce((acc, weight, idx) => acc + Number(slice[idx]) * weight, 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(digits.slice(0, 12), weights1);
  if (d1 !== Number(digits[12])) return false;

  const d2 = calcDigit(digits.slice(0, 13), weights2);
  if (d2 !== Number(digits[13])) return false;

  return true;
}

/**
 * Aplica máscara progressiva de CPF (XXX.XXX.XXX-XX) ou CNPJ (XX.XXX.XXX/XXXX-XX)
 * removendo imediatamente qualquer caractere não-numérico.
 */
export function formatCpfCnpjMask(raw: string | null | undefined): string {
  const digits = onlyDigits(raw).slice(0, 14);
  if (!digits) return "";

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/**
 * Valida e normaliza um documento (CPF ou CNPJ) para armazenamento padronizado no PostgreSQL.
 */
export function validateAndSanitizeDocument(raw: string | null | undefined): {
  valid: boolean;
  type: "CPF" | "CNPJ" | "EMPTY" | "INVALID";
  digits: string;
  formatted: string | null;
  error?: string;
} {
  if (!raw || raw.trim() === "") {
    return { valid: true, type: "EMPTY", digits: "", formatted: null };
  }

  // Rejeita imediatamente tentativas explícitas de injeção de código ou letras fora de formatação
  if (hasMaliciousInjection(raw) || /[a-zA-Z<>;'"`\\]/.test(raw)) {
    return {
      valid: false,
      type: "INVALID",
      digits: "",
      formatted: null,
      error:
        "Entrada bloqueada: o campo CNPJ/CPF contém caracteres inválidos ou tentativa de injeção.",
    };
  }

  const digits = onlyDigits(raw);

  if (digits.length === 11) {
    if (!isValidCPF(digits)) {
      return {
        valid: false,
        type: "INVALID",
        digits,
        formatted: null,
        error: "CPF inválido: dígitos verificadores (Módulo 11) não conferem.",
      };
    }
    return {
      valid: true,
      type: "CPF",
      digits,
      formatted: formatCpfCnpjMask(digits),
    };
  }

  if (digits.length === 14) {
    if (!isValidCNPJ(digits)) {
      return {
        valid: false,
        type: "INVALID",
        digits,
        formatted: null,
        error: "CNPJ inválido: dígitos verificadores (Módulo 11) não conferem.",
      };
    }
    return {
      valid: true,
      type: "CNPJ",
      digits,
      formatted: formatCpfCnpjMask(digits),
    };
  }

  return {
    valid: false,
    type: "INVALID",
    digits,
    formatted: null,
    error: "Formato de documento inválido. Informe exatamente 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
  };
}

/**
 * Sanitiza e formata telefone corporativo/WhatsApp no padrão (XX) XXXXX-XXXX.
 */
export function sanitizeAndFormatPhone(raw: string | null | undefined): {
  valid: boolean;
  formatted: string;
  error?: string;
} {
  if (!raw || raw.trim() === "") {
    return { valid: true, formatted: "" };
  }

  if (hasMaliciousInjection(raw) || /[a-zA-Z<>;'"`\\]/.test(raw)) {
    return {
      valid: false,
      formatted: "",
      error: "Telefone inválido: caracteres não numéricos ou maliciosos detectados.",
    };
  }

  const digits = onlyDigits(raw).slice(0, 11);
  if (digits.length < 10 || digits.length > 11) {
    return {
      valid: false,
      formatted: "",
      error: "Informe um telefone válido com DDD (10 ou 11 dígitos).",
    };
  }

  const ddd = digits.slice(0, 2);
  const part1 = digits.length === 11 ? digits.slice(2, 7) : digits.slice(2, 6);
  const part2 = digits.length === 11 ? digits.slice(7, 11) : digits.slice(6, 10);

  return {
    valid: true,
    formatted: `(${ddd}) ${part1}-${part2}`,
  };
}

/**
 * Máscara progressiva de telefone para uso em inputs React.
 */
export function formatPhoneMask(raw: string | null | undefined): string {
  const digits = onlyDigits(raw).slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Sanitiza Inscrição Estadual permitindo apenas dígitos ou a palavra reservada "ISENTO".
 */
export function sanitizeStateRegistration(raw: string | null | undefined): {
  valid: boolean;
  formatted: string | null;
  error?: string;
} {
  if (!raw || raw.trim() === "") {
    return { valid: true, formatted: null };
  }

  if (hasMaliciousInjection(raw)) {
    return {
      valid: false,
      formatted: null,
      error: "Inscrição Estadual bloqueada por tentativa de injeção.",
    };
  }

  const upper = raw.trim().toUpperCase();
  if (upper === "ISENTO" || upper === "ISENTA") {
    return { valid: true, formatted: "ISENTO" };
  }

  if (/[^0-9.\-/]/.test(upper)) {
    return {
      valid: false,
      formatted: null,
      error: "Inscrição Estadual deve conter apenas números ou 'ISENTO'.",
    };
  }

  const digits = onlyDigits(upper);
  if (digits.length < 7 || digits.length > 14) {
    return {
      valid: false,
      formatted: null,
      error: "Inscrição Estadual deve ter entre 7 e 14 dígitos numéricos ou 'ISENTO'.",
    };
  }

  return { valid: true, formatted: digits };
}
