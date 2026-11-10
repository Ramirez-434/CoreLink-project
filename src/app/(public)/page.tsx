import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package } from "lucide-react";
import { auth } from "@/auth";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

export default async function Home() {
  const session = await auth();
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
          <div className="max-w-3xl pl-4 md:pl-8 animate-fade-in-up lg:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
              Soluções <br />
              <span className="text-primary dark:text-blue-400">Empresariais</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium mb-8 max-w-lg leading-relaxed text-balance">
              Sistemas de gestão empresarial, emissão de NF-e e controle operacional para acelerar o crescimento da sua empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
              <Link 
                href="/sistemas" 
                className="text-center bg-primary text-white font-bold px-8 py-3.5 min-h-[44px] flex items-center justify-center rounded-xl hover:bg-primary-hover shadow-sm transition-all text-sm sm:text-base shrink-0"
              >
                Explorar Sistemas
              </Link>
              {!session ? (
                <Link 
                  href="/cadastro" 
                  className="text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-bold px-8 py-3.5 min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all text-sm sm:text-base shrink-0"
                >
                  Cadastre sua Empresa
                </Link>
              ) : (
                <Link 
                  href="/minha-conta" 
                  className="text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-bold px-8 py-3.5 min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all text-sm sm:text-base shrink-0"
                >
                  Acessar Painel
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200/60 dark:border-gray-800">
              <span className="flex items-center gap-1.5">✓ Implantação Assistida</span>
              <span className="flex items-center gap-1.5">✓ NF-e & SPED Fiscal</span>
              <span className="flex items-center gap-1.5">✓ Suporte via WhatsApp</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 animate-fade-in-up">
            <img
              src="/images/tech-software.jpg"
              alt="Painel corporativo do CoreLink para gestão e faturamento empresarial"
              className="w-full rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-10 text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sistemas em Destaque
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto text-balance">
            Softwares corporativos testados e aprovados para vendas, faturamento e gestão.
          </p>
        </div>

        {/* Features / Products Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              Em breve novos produtos disponíveis no catálogo.
            </div>
          ) : (
            products.map((product, index) => (
              <div 
                key={product.id} 
                className="border border-gray-200 dark:border-gray-800 rounded-2xl p-7 text-center bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div>
                  <img
                    src={product.imageUrl || "/images/tech-product.jpg"}
                    alt={product.name}
                    className="w-20 h-20 object-cover mx-auto mb-5 rounded-2xl shadow-sm"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                  <div className="mb-6">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                      {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">/ licença</span>
                  </div>
                </div>
                <div className="space-y-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/60">
                  <Link 
                    href={`/produto/${product.id}`}
                    className="inline-flex items-center justify-center bg-primary text-white text-sm font-bold px-6 py-2.5 min-h-[44px] rounded-xl hover:bg-primary-hover shadow-sm transition-colors w-full"
                  >
                    Ver Detalhes do Sistema
                  </Link>
                  <AddToCartButton 
                    product={{ id: product.id, name: product.name, price: product.price }} 
                    variant="outline"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sequence: Como Funciona o CoreLink */}
        <div className="mt-28 pt-16 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Como Funciona a Contratação e Ativação
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-balance">
              Do catálogo à emissão da sua primeira nota fiscal, com acompanhamento direto da nossa equipe técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-extrabold text-primary dark:text-blue-400 mb-3 tabular-nums">
                  01
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Escolha seu Sistema
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Explore nosso catálogo com preços transparentes em Reais (R$), sem taxas ocultas ou surpresas na contratação.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Catálogo B2B Self-Service
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-3 tabular-nums">
                  02
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Cadastro da Empresa
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Informe os dados básicos da sua empresa (CNPJ, Razão Social e Inscrição Estadual) com validação Módulo 11 da Receita Federal.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Conformidade Fiscal & NF-e
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-3 tabular-nums">
                  03
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Ativação & WhatsApp
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nossa equipe técnica entra em contato direto via WhatsApp Comercial com o pedido parametrizado para colocar o software em produção.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Implantação em até 24 Horas
              </div>
            </div>
          </div>
        </div>

      {/* Benefits / Features Section */}
      <div className="mt-32 pt-16 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Por que escolher a <span className="text-primary dark:text-blue-400">HJ Infor</span>?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-balance">
            Nossa plataforma foi construída pensando nas necessidades reais do seu dia a dia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Conformidade Fiscal", 
              desc: "Emissão sem travamento de NF-e, NFC-e e SPED Fiscal com validação algorítmica da Receita Federal.", 
              image: "/images/card-seguranca.jpg", 
              tag: "SEFAZ & NF-e", 
              tagColor: "bg-blue-700 text-white" 
            },
            { 
              title: "Implantação Assistida", 
              desc: "Suporte humano direto e contextualizado via WhatsApp Comercial para colocar seu sistema em produção em até 24h.", 
              image: "/images/card-suporte.jpg", 
              tag: "WhatsApp Direto", 
              tagColor: "bg-emerald-800 text-white" 
            },
            { 
              title: "Guarda Fiscal & LGPD", 
              desc: "Armazenamento seguro de XMLs fiscais por 5 anos, backups diários na nuvem e conformidade estrita com a LGPD.", 
              image: "/images/card-velocidade.jpg", 
              tag: "Guarda 5 Anos", 
              tagColor: "bg-slate-800 text-white" 
            },
            { 
              title: "Frente de Caixa Ágil", 
              desc: "Interface intuitiva para PDV rápido com suporte a leitor de código de barras e impressoras fiscais.", 
              image: "/images/card-facil.jpg", 
              tag: "PDV & Vendas", 
              tagColor: "bg-blue-800 text-white" 
            },
          ].map((feature, index) => (
            <div key={index} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
              {/* Imagem */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <span className={`absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${feature.tagColor} shadow-sm`}>
                  {feature.tag}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="p-6 pt-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-32 mb-16 relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-10 md:p-14 text-center shadow-xl animate-fade-in-up delay-200">
        {/* Imagem de fundo com opacidade suave */}
        <img src="/images/tech-hero.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Pronto para modernizar a gestão da sua empresa?
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed text-balance">
            Cadastre sua empresa e conte com a implantação assistida da equipe técnica da HJ Infor para faturar com tranquilidade.
          </p>
          {!session && (
            <Link 
              href="/cadastro" 
              className="inline-flex items-center justify-center bg-white text-primary font-bold px-10 py-3.5 min-h-[44px] rounded-xl hover:bg-blue-50 shadow-md transition-all text-sm sm:text-base"
            >
              Cadastrar Empresa
            </Link>
          )}
          {session && (
            <Link 
              href="/sistemas" 
              className="inline-flex items-center justify-center bg-white text-primary font-bold px-10 py-3.5 min-h-[44px] rounded-xl hover:bg-blue-50 shadow-md transition-all text-sm sm:text-base"
            >
              Ver Sistemas
            </Link>
          )}
        </div>
      </div>
      
    </div>
    </div>
  );
}
