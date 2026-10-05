import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Monitor, CheckCircle2, ShieldCheck, ChevronDown, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product || !product.isAvailable) {
    redirect("/sistemas");
  }

  const features = product.features || [];
  const faqData = product.faq as any[] || [];

  return (
    <div className="relative overflow-hidden min-h-screen pb-24 bg-gray-50/50 dark:bg-black">
      {/* Background Glowing Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* HERO SECTION */}
      <div className="container relative z-10 mx-auto px-4 pt-16 pb-12 max-w-6xl animate-fade-in-up">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 flex flex-col lg:flex-row gap-12">
          
          {/* Left: Media */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 flex items-center justify-center border border-gray-100 dark:border-gray-700 relative group overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover max-h-[400px] rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <Monitor size={120} className="text-gray-300 dark:text-gray-600" />
              )}
              {/* Optional: Add a "best seller" or "new" badge here later */}
            </div>

            {product.videoUrl && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm relative">
                <iframe src={product.videoUrl} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
              </div>
            )}
          </div>
          
          {/* Right: Info & CTA */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white tracking-tight">
                {product.name}
              </h1>
              <p className="text-3xl font-extrabold text-primary dark:text-blue-400 mb-2">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              {product.isSubscription && (
                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Assinatura {product.billingCycle === "YEARLY" ? "Anual" : "Mensal"}
                </span>
              )}
            </div>

            {/* Features Preview */}
            {features.length > 0 && (
              <div className="mb-8 space-y-3">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">O que está incluído:</h3>
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Call to Action */}
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
              {product.isAvailable ? (
                <div className="flex flex-col gap-4">
                  <Link 
                    href={`/checkout/${product.id}`}
                    className="group relative flex justify-center items-center bg-primary text-white text-lg font-bold py-4 px-8 rounded-2xl hover:bg-primary-hover hover-lift transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] w-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      <Zap size={20} />
                      Comprar Agora
                    </span>
                  </Link>
                  <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} />
                  
                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-500"/> Compra 100% Segura</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-blue-500"/> Acesso Imediato</span>
                  </div>
                </div>
              ) : (
                <div className="text-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold py-4 px-8 rounded-2xl w-full">
                  Produto Esgotado / Indisponível
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION SECTION (Markdown) */}
      <div className="container mx-auto px-4 max-w-4xl mb-16 animate-fade-in-up delay-100">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">Detalhes do Sistema</h2>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <ReactMarkdown>
              {product.description}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      {faqData && faqData.length > 0 && (
        <div className="container mx-auto px-4 max-w-4xl animate-fade-in-up delay-200">
          <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-gray-900 dark:text-white">
                  {faq.question}
                  <span className="transition group-open:rotate-180">
                    <ChevronDown size={20} className="text-gray-400" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
