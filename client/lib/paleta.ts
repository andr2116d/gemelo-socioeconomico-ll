// Paleta categórica de comunidades. La MISMA en todas las vistas (mapa,
// scatter, badges) para que el usuario asocie color → comunidad sin confusión.

/** 8 colores accesibles, indexados por número de comunidad (0-7). */
export const PALETA_COMUNIDADES = [
  "#2563eb", // 0 azul
  "#dc2626", // 1 rojo
  "#16a34a", // 2 verde
  "#9333ea", // 3 morado
  "#ea580c", // 4 naranja
  "#0891b2", // 5 cian
  "#ca8a04", // 6 dorado
  "#db2777", // 7 rosa
] as const;

/** Color de una comunidad. Usa módulo por si aparecen más de 8 comunidades. */
export function colorComunidad(comunidad: number): string {
  const indice =
    ((comunidad % PALETA_COMUNIDADES.length) + PALETA_COMUNIDADES.length) %
    PALETA_COMUNIDADES.length;
  return PALETA_COMUNIDADES[indice];
}

/** Etiqueta legible de una comunidad. */
export function etiquetaComunidad(comunidad: number): string {
  return `Comunidad ${comunidad}`;
}

/** Nombre humano del método de detección. */
export function nombreMetodo(metodo: "louvain" | "graphsage"): string {
  return metodo === "louvain" ? "Louvain" : "GraphSAGE";
}
