import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package } from "lucide-react";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="relative overflow-hidden">
      {/* Background Glowing Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-32">
        {/* Hero Section */}
        <div className="max-w-3xl mb-16 pl-4 md:pl-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-200 text-transparent bg-clip-text animate-gradient-x">
              Soluções <br /> Empresariais
            </span>
          </h1>
        <p className="text-lg text-gray-900 dark:text-gray-200 font-bold mb-10 max-w-sm leading-relaxed transition-colors">
          Sistemas inovadores para o seu negócio.
        </p>
          {!session && (
            <div className="flex flex-col gap-4 w-48 relative">
              <Link 
                href="/cadastro" 
                className="relative text-center bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-hover hover-lift shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all z-10 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                Cadastre-se
              </Link>
              <Link 
                href="/login" 
                className="text-center bg-white dark:bg-transparent text-primary dark:text-blue-400 border-2 border-primary dark:border-blue-400 font-bold px-8 py-3 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 hover-lift shadow-sm transition-all"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Features / Products Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            Em breve novos produtos disponíveis.
          </div>
        ) : (
          products.map((product, index) => (
            <div 
              key={product.id} 
              className={`border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center bg-white dark:bg-gray-800/50 transition-all duration-500 hover-lift animate-fade-in-up flex flex-col justify-between h-full`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover mx-auto mb-6 rounded-2xl shadow-sm" />
                ) : (
                  <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-2xl flex items-center justify-center shadow-sm">
                    <Package size={40} strokeWidth={1.5} />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">{product.description}</p>
              </div>
              <Link 
                href={`/produto/${product.id}`}
                className="inline-block bg-primary text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-primary-hover transition-colors w-full"
              >
                Saiba mais
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Benefits / Features Section */}
      <div className="mt-32 pt-16 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Por que escolher a <span className="text-primary dark:text-blue-400">HJ Infor</span>?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Nossa plataforma foi construída pensando nas necessidades reais do seu dia a dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { title: "Segurança", desc: "Seus dados criptografados e com backup automático diário na nuvem.", icon: "🔒" },
            { title: "Velocidade", desc: "Sistema ultrarrápido que não trava e não te deixa esperando.", icon: "⚡" },
            { title: "Suporte 24/7", desc: "Equipe especializada pronta para te ajudar a qualquer momento.", icon: "💬" },
            { title: "Fácil de Usar", desc: "Interface intuitiva que não exige meses de treinamento para sua equipe.", icon: "✨" },
          ].map((feature, index) => (
            <div key={index} className={`bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover-lift animate-fade-in-up delay-${(index + 1) * 100}`}>
              <div className="text-4xl mb-4 bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-xl flex items-center justify-center">{feature.icon}</div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-32 mb-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 p-12 text-center shadow-2xl animate-fade-in-up delay-200">
        {/* Orbs inside CTA */}
        <div className="absolute top-0 -left-12 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 -right-12 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Pronto para transformar sua empresa?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Junte-se a milhares de empresas que já simplificaram sua gestão com nossos sistemas.
          </p>
          {!session && (
            <Link 
              href="/cadastro" 
              className="inline-block bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-blue-50 hover-lift shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
            >
              Criar conta grátis
            </Link>
          )}
          {session && (
            <Link 
              href="/sistemas" 
              className="inline-block bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-blue-50 hover-lift shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
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
