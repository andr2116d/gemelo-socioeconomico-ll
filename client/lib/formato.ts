// Utilidades de formato numérico en español (Perú).

const formateadorEntero = new Intl.NumberFormat("es-PE", {
  maximumFractionDigits: 0,
});

const formateadorDecimal = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un entero con separadores de miles. */
export function formatearEntero(valor: number): string {
  return formateadorEntero.format(valor);
}

/** Formatea un número con 2 decimales. */
export function formatearDecimal(valor: number): string {
  return formateadorDecimal.format(valor);
}

/** Formatea un monto en soles con separadores de miles. */
export function formatearSoles(valor: number): string {
  return `S/ ${formateadorEntero.format(valor)}`;
}

/** Capitaliza cada palabra (los nombres vienen en MAYÚSCULAS del backend). */
export function capitalizar(texto: string): string {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palabra) =>
      palabra.length > 0 ? palabra[0].toUpperCase() + palabra.slice(1) : palabra,
    )
    .join(" ");
}
