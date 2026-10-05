import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 5000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
