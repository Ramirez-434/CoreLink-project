function onlyDigits(raw) {
  return String(raw || "").replace(/\D/g, "");
}

function hasMaliciousInjection(raw) {
  if (!raw) return false;
  const patterns = [
    /<script\b[^>]*>[\s\S]*?<\/script>/i,
    /<\/?[a-z][^>]*>/i,
    /javascript\s*:/i,
    /\bon[a-z]+\s*=/i,
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|TRUNCATE)\b\s+\b(FROM|INTO|TABLE|ALL|SELECT|SET)\b)/i,
    /(--|\/\*|\*\/|;\s*--)/,
  ];
  return patterns.some((p) => p.test(raw));
}

function isValidCPF(raw) {
  const digits = onlyDigits(raw);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== Number(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === Number(digits[10]);
}

function isValidCNPJ(raw) {
  const digits = onlyDigits(raw);
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calc = (slice, w) => {
    const s = w.reduce((a, b, i) => a + Number(slice[i]) * b, 0);
    const m = s % 11;
    return m < 2 ? 0 : 11 - m;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return (
    calc(digits.slice(0, 12), w1) === Number(digits[12]) &&
    calc(digits.slice(0, 13), w2) === Number(digits[13])
  );
}

function formatMask(digits) {
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function validateAndSanitizeDocument(raw) {
  if (hasMaliciousInjection(raw) || /[a-zA-Z<>;'"`\\]/.test(raw)) {
    return { valid: false, status: "BLOQUEADO (INJECTION)", output: null };
  }
  const digits = onlyDigits(raw);
  if (digits.length === 11) {
    return isValidCPF(digits)
      ? { valid: true, status: "CPF VALIDO (MOD-11)", output: formatMask(digits) }
      : { valid: false, status: "REJEITADO (DV CPF INVALIDO)", output: null };
  }
  if (digits.length === 14) {
    return isValidCNPJ(digits)
      ? { valid: true, status: "CNPJ VALIDO (MOD-11)", output: formatMask(digits) }
      : { valid: false, status: "REJEITADO (DV CNPJ INVALIDO)", output: null };
  }
  return { valid: false, status: "REJEITADO (TAMANHO INVALIDO)", output: null };
}

console.log("========================================================================");
console.log(" AUDITORIA DE SEGURANCA - VULNERABILIDADE 1 (SANITIZACAO E INJECTION)");
console.log("========================================================================");

const cases = [
  { label: "SQL Injection no CNPJ", input: "11222333000181'; DROP TABLE User; --" },
  { label: "XSS Payload no Perfil", input: "<script>fetch('https://evil.com')</script>" },
  { label: "CNPJ Sequencia Falsa", input: "00.000.000/0000-00" },
  { label: "CNPJ Digito Invalido", input: "11.222.333/0001-99" },
  { label: "CNPJ Sem Mascara Valido", input: "11222333000181" },
  { label: "CPF Sem Mascara Valido", input: "52998224725" },
];

for (const c of cases) {
  const res = validateAndSanitizeDocument(c.input);
  console.log(
    ` [${res.valid ? "ACEITO   " : "BLOQUEADO"}] ${c.label.padEnd(24)} -> ${res.status} ${
      res.output ? `=> Gravado: ${res.output}` : ""
    }`
  );
}
console.log("========================================================================");
