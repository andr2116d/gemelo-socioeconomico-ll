"use client";

import type { MetodoComunidad } from "@/types";

interface Props {
  valor: MetodoComunidad;
  alCambiar: (metodo: MetodoComunidad) => void;
  tamano?: "sm" | "md";
}

/**
 * Toggle Louvain vs GraphSAGE. Reutilizable en el mapa, el comparador
 * y el explorador de embeddings.
 */
export default function SelectorMetodo({ valor, alCambiar, tamano = "md" }: Props) {
  const opciones: { clave: MetodoComunidad; etiqueta: string }[] = [
    { clave: "louvain", etiqueta: "Louvain" },
    { clave: "graphsage", etiqueta: "GraphSAGE" },
  ];

  const padding = tamano === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <div className="inline-flex rounded-xl border border-[var(--borde)] bg-[var(--fondo)] p-1">
      {opciones.map((opcion) => (
        <button
          key={opcion.clave}
          type="button"
          onClick={() => alCambiar(opcion.clave)}
          className={`rounded-lg font-medium transition-colors ${padding} ${
            valor === opcion.clave
              ? "bg-[var(--acento)] text-white shadow-sm"
              : "text-[var(--texto-suave)] hover:text-[var(--texto)]"
          }`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}
