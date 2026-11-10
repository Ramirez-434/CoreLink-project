import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const { id } = await params;
  const [product, user] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        companyName: true,
        document: true,
        stateRegistration: true,
      },
    }),
  ]);

  if (!product || !product.isAvailable) {
    redirect("/sistemas");
  }

  const clientProfile = {
    name: user?.name || session.user.name || "Cliente Corporativo",
    companyName: user?.companyName?.trim() || user?.name || session.user.name || "Empresa Cliente",
    document: user?.document || null,
    stateRegistration: user?.stateRegistration || null,
  };

  return (
    <div className="min-h-[80vh] py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Finalizar Compra</h1>
          <p className="text-gray-500 dark:text-gray-400">Você está a um passo de transformar a gestão da sua empresa.</p>
        </div>

        <CheckoutForm product={product} clientProfile={clientProfile} />
      </div>
    </div>
  );
}
