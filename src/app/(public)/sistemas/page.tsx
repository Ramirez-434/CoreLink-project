import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { CatalogGridSkeleton } from "@/components/ui/Skeleton";

async function CatalogProductsStream() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
        Nenhum sistema disponível no momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="border border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-white dark:bg-gray-800/50 transition-all duration-500 hover-lift animate-fade-in-up flex flex-col justify-between h-full"
          style={{ animationDelay: `${(index + 1) * 100}ms` }}
        >
          <div>
            <img
              src={product.imageUrl || "/images/tech-product.jpg"}
              alt={product.name}
              className="w-24 h-24 object-cover mx-auto mb-6 rounded-2xl shadow-sm"
            />

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {product.description}
            </p>
            <p className="text-xl font-extrabold text-primary dark:text-blue-400 mb-6">
              {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
          <div>
            <Link
              href={`/produto/${product.id}`}
              className="inline-block bg-primary text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-primary-hover transition-colors w-full"
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
  const forceSkeleton = sp.skeleton === "true" || sp.skeleton === "1";

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Glowing Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-4 py-16 max-w-5xl animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-200 text-transparent bg-clip-text animate-gradient-x">
            Nossos Sistemas
          </span>
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-16">
          Conheça as soluções que desenvolvemos para impulsionar o seu negócio.
        </p>

        {forceSkeleton ? (
          <CatalogGridSkeleton count={6} />
        ) : (
          <Suspense fallback={<CatalogGridSkeleton count={6} />}>
            <CatalogProductsStream />
          </Suspense>
        )}
      </div>
    </div>
  );
}
