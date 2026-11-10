import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/components/CartContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "CoreLink | Soluções Empresariais - HJ Infor",
  description: "Sistemas inovadores para o seu negócio. Catálogo e gestão de softwares CoreLink.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} antialiased h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 5000,
              }}
            />
          </CartProvider>
        </ThemeProvider>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js?token=1f3b2189-747b-463d-85f6-a1155b58dc06"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
