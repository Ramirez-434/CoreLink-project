import Navbar from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CookieBanner } from "@/components/ui/CookieBanner";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
