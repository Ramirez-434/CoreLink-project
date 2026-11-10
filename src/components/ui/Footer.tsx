import Link from "next/link";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4 animate-fade-in-up">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight inline-block">
              HJ Infor
            </span>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Transformando a gestão de pequenas e médias empresas com sistemas inteligentes, rápidos e fáceis de usar.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-blue-400 transition-colors hover-lift" aria-label="Portal Institucional">
                <Globe size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors hover-lift" aria-label="WhatsApp Comercial">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="animate-fade-in-up delay-100">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Início
                </Link>
              </li>
              <li>
                <Link href="/sistemas" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Sistemas
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div className="animate-fade-in-up delay-200">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Nossos Sistemas</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sistemas" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors text-sm">
                  CoreLink ERP Cloud
                </Link>
              </li>
              <li>
                <Link href="/sistemas" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors text-sm">
                  PDV Vendas & Frente de Caixa
                </Link>
              </li>
              <li>
                <Link href="/sistemas" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors text-sm">
                  Gestão & BI Premium
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="animate-fade-in-up delay-300">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Fale Conosco</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">Porto Seguro - BA (Atendimento Nacional)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm tabular-nums">(73) 99999-9999</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">contato@hjinfor.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up delay-400">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} HJ Infor. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/termos" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Privacidade (LGPD)</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
