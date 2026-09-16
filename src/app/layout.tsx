
import type { Metadata } from "next";
// @ts-ignore - Next permite importar CSS global en el layout raíz
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "Conecta U",
  description: "Conecta U - plataforma de conexión universitaria",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
