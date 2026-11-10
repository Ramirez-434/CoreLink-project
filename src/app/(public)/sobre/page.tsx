import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Users, Zap } from "lucide-react";

export const metadata = {
  title: "Sobre a HJ Infor | CoreLink Soluções Empresariais",
  description: "Conheça a história, missão e diferenciais da HJ Infor e da plataforma CoreLink no desenvolvimento de softwares B2B.",
};

export default function SobrePage() {
  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl animate-fade-in-up">
        {/* Cabeçalho */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Sobre a CoreLink & HJ Infor
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-balance">
            Tecnologia corporativa prática e acessível para transformar a gestão, o faturamento e a produtividade de pequenas e médias empresas brasileiras.
          </p>
        </div>

        <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Apresentação Principal */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <p className="text-base sm:text-lg">
              A <strong>HJ Infor</strong> é a empresa de tecnologia desenvolvedora e operadora comercial por trás da plataforma <strong>CoreLink</strong>. Desde nossa fundação, temos o compromisso intransigente de entregar sistemas de gestão empresarial (ERP, PDV, Estoque e NF-e) confiáveis, rápidos e sem complexidades desnecessárias.
            </p>
            <p className="text-base">
              Acreditamos que todo empreendedor merece ferramentas poderosas para controlar suas finanças, emitir documentos fiscais em conformidade e acelerar suas vendas com tranquilidade.
            </p>
          </div>

          {/* Imagem Institucional */}
          <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg">
            <img
              src="/images/tech-team.jpg"
              alt="Equipe de tecnologia e desenvolvimento de software colaborando"
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Pilares & Missão */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Zap size={22} className="text-primary dark:text-blue-400 shrink-0" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Inovação Contínua</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Atualizações regulares alinhadas às novas exigências fiscais brasileiras (NF-e, NFC-e e SPED) e regras tributárias.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Implantação Assistida</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Suporte humano direto e contextualizado via WhatsApp Comercial para colocar seu sistema em produção sem perda de tempo.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={22} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Segurança de Dados</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Criptografia de ponta a ponta, backups automatizados em nuvem e total conformidade com as diretrizes da LGPD.
              </p>
            </div>
          </div>

          {/* Imagem de Segurança */}
          <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg">
            <img
              src="/images/tech-security.jpg"
              alt="Segurança e proteção de infraestrutura corporativa na nuvem"
              className="w-full h-80 object-cover"
            />
          </div>

          {/* CTA Final */}
          <div className="bg-gray-50 dark:bg-gray-800/90 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pronto para impulsionar seu negócio?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto text-balance">
              Explore nosso catálogo de licenças ou fale diretamente com nossa equipe de atendimento.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/sistemas"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-3 min-h-[44px] rounded-xl shadow-sm transition-colors"
              >
                Conhecer Nossos Sistemas <ArrowRight size={16} />
              </Link>
              <Link
                href="/contato"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 text-sm font-bold px-6 py-3 min-h-[44px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors"
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
