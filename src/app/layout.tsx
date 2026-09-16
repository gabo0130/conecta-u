
import type { Metadata } from "next";
import { Public_Sans, Sora } from "next/font/google";
// @ts-ignore - Next permite importar CSS global en el layout raíz
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Conecta U",
  description:
    "Plataforma inteligente para articular necesidades, capacidades y proyectos universitarios (UFPS).",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${sora.variable} ${publicSans.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
