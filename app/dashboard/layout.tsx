import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 👇 1. Importamos el puente acá arriba
import Providers from "./Providers"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Somos Nene",
  description: "Panel de control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 👇 2. Envolvemos a los children con el Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}