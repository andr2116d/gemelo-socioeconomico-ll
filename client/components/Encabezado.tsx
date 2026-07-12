"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ENLACES = [
  { href: "/", etiqueta: "Mapa" },
  { href: "/comunidades", etiqueta: "Comunidades" },
  { href: "/embeddings", etiqueta: "Embeddings" },
  { href: "/simulador", etiqueta: "Simulador" },
];

/** Barra de navegación superior, presente en todas las vistas. */
export default function Encabezado() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  const esActivo = (href: string) =>
    href === "/" ? ruta === "/" : ruta.startsWith(href);

  return (
    <header className="sticky top-0 z-[500] border-b border-[var(--borde)] bg-[var(--superficie)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Logo" width={34} height={34} priority />
          <div className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">
              Gemelo Digital
            </span>
            <span className="block text-[11px] text-[var(--texto-suave)]">
              Socioeconómico · La Libertad
            </span>
          </div>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-1 md:flex">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                esActivo(enlace.href)
                  ? "bg-[var(--acento)] text-white"
                  : "text-[var(--texto-suave)] hover:bg-[var(--fondo)] hover:text-[var(--texto)]"
              }`}
            >
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>

        {/* Botón de menú móvil */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setAbierto((v) => !v)}
          className="rounded-lg p-2 text-[var(--texto-suave)] hover:bg-[var(--fondo)] md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {abierto ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Navegación móvil desplegable */}
      {abierto && (
        <nav className="flex flex-col gap-1 border-t border-[var(--borde)] px-4 py-2 md:hidden">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              onClick={() => setAbierto(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                esActivo(enlace.href)
                  ? "bg-[var(--acento)] text-white"
                  : "text-[var(--texto-suave)] hover:bg-[var(--fondo)]"
              }`}
            >
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
