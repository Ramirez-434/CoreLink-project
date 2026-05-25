import Link from "next/link";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4 animate-fade-in-up">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text inline-block animate-gradient-x">
              HJ Infor
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Transformando a gestão de pequenas e médias empresas com sistemas inteligentes, rápidos e fáceis de usar.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors hover-lift">
                <Globe size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors hover-lift">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="animate-fade-in-up delay-100">
            <h4 className="font-bold text-gray-900 mb-6">Navegação</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Início
                </Link>
              </li>
              <li>
                <Link href="/sistemas" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Sistemas
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center group">
                  <span className="w-0 group-hover:w-2 transition-all overflow-hidden inline-block h-px bg-primary mr-0 group-hover:mr-2"></span>
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div className="animate-fade-in-up delay-200">
            <h4 className="font-bold text-gray-900 mb-6">Nossos Sistemas</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/produto/1" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  AdminPro ERP
                </Link>
              </li>
              <li>
                <Link href="/produto/2" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  PDV Vendas
                </Link>
              </li>
              <li>
                <Link href="/produto/3" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Gestão de Equipe
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="animate-fade-in-up delay-300">
            <h4 className="font-bold text-gray-900 mb-6">Fale Conosco</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-sm">Av. Paulista, 1000 - Bela Vista, São Paulo - SP</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <span className="text-gray-600 text-sm">(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span className="text-gray-600 text-sm">contato@hjinfor.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up delay-400">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} HJ Infor. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
