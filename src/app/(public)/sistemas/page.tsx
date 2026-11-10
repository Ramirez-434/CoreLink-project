import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { CatalogGridSkeleton } from "@/components/ui/Skeleton";
import { Package, Search, X } from "lucide-react";

export const metadata = {
  title: "Sistemas & Softwares Empresariais | CoreLink",
  description: "Conheça o catálogo de sistemas corporativos, ERP, PDV e controle empresarial da HJ Infor.",
};

async function CatalogProductsStream({ query }: { query?: string }) {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/40">
        <Package size={40} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        <p className="text-base font-bold text-gray-800 dark:text-gray-200">
          {query ? `Nenhum sistema encontrado para "${query}".` : "Nenhum sistema disponível no momento."}
        </p>
        {query && (
          <Link
            href="/sistemas"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-primary dark:text-blue-400 hover:underline"
          >
            <X size={14} /> Limpar filtro de busca
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="border border-gray-200 dark:border-gray-700/80 rounded-2xl p-7 text-center bg-white dark:bg-gray-800/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full"
          style={{ animationDelay: `${(index + 1) * 100}ms` }}
        >
          <div>
            <img
              src={product.imageUrl || "/images/tech-product.jpg"}
              alt={product.name}
              className="w-24 h-24 object-cover mx-auto mb-6 rounded-2xl shadow-sm"
            />

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 leading-relaxed">
              {product.description}
            </p>
            <div className="mb-6">
              <span className="text-2xl font-extrabold text-primary dark:text-blue-400 tabular-nums">
                {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">/ licença</span>
            </div>
          </div>
          <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-700/60">
            <Link
              href={`/produto/${product.id}`}
              className="inline-flex items-center justify-center bg-primary text-white text-sm font-bold px-6 py-2.5 min-h-[44px] rounded-xl hover:bg-primary-hover shadow-sm transition-colors w-full"
            >
              Saiba mais
            </Link>
            <AddToCartButton
              product={{ id: product.id, name: product.name, price: product.price }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SistemasPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const query = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const forceSkeleton = sp.skeleton === "true" || sp.skeleton === "1";

  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl animate-fade-in-up">
        {/* Header da Página */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            Nossos Sistemas
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-balance">
            Soluções completas de ERP, frente de caixa e inteligência de negócios desenvolvidas para acelerar sua empresa.
          </p>

          {query && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/50 dark:border-blue-800/50">
              <Search size={13} />
              Filtrado por: "{query}"
              <Link href="/sistemas" className="ml-1 hover:text-red-500">
                <X size={13} />
              </Link>
            </div>
          )}
        </div>

        {forceSkeleton ? (
          <CatalogGridSkeleton count={6} />
        ) : (
          <Suspense fallback={<CatalogGridSkeleton count={6} />}>
            <CatalogProductsStream query={query} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
