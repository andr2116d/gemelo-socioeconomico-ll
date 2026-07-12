import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Encabezado from "@/components/Encabezado";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gemelo Digital Socioeconómico — La Libertad",
  description:
    "Explora las comunidades socioeconómicas de los 83 distritos de La Libertad, Perú, detectadas con GraphSAGE y Louvain sobre un grafo de distritos.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--fondo)] text-[var(--texto)]">
        <Encabezado />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
