import { prisma } from "@/lib/prisma";
import { ProdutosManager } from "./ProdutosManager";

export default async function AdminProdutos() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <ProdutosManager initialProducts={products} />;
}
