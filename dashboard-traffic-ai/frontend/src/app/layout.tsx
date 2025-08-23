import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Traffic AI - Monitoramento de Tráfego Pago",
  description: "Dashboard profissional para monitorar campanhas de tráfego pago em múltiplas plataformas",
  keywords: "dashboard, tráfego pago, marketing digital, instagram, facebook, tiktok, meta ads, google ads",
  authors: [{ name: "Traffic AI Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
