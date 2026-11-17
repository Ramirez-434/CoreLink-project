import Navbar from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { getSystemSetting } from "@/actions/settings";
import { Wrench } from "lucide-react";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const maintenanceMode = await getSystemSetting("maintenance_mode", "false");

  return (
    <>
      {maintenanceMode === "true" && (
        <div
          role="status"
          className="bg-amber-500 text-slate-950 px-4 py-2.5 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          <Wrench size={16} className="shrink-0" />
          <span>
            Modo de Manutenção Programada ativo: algumas operações de contratação podem passar por instabilidade temporária.
          </span>
        </div>
      )}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
