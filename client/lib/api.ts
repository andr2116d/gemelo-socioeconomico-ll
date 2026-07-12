// Cliente de API centralizado. TODAS las llamadas al backend pasan por aquí.
// Ningún componente debe hacer `fetch` directo.

import type {
  DistritoResumen,
  FeatureDistrito,
  ColeccionComunidades,
  ResumenComunidad,
  PuntoProyeccion,
  DistritoSimilar,
  Arista,
  VecinosNodo,
  EntradaSimulacion,
  ResultadoSimulacion,
  MetodoComunidad,
  TipoArista,
} from "@/types";

// URL base configurable por variable de entorno. Nunca hardcodear.
const URL_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

/** Realiza un GET tipado contra el backend, con manejo de error uniforme. */
async function obtenerJson<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      // Datos que cambian poco: dejamos que Next revalide, pero sin cachear
      // agresivamente para no servir información obsoleta en desarrollo.
      cache: "no-store",
      ...opciones,
    });
  } catch {
    throw new Error(
      `No se pudo conectar con el backend (${URL_BASE}). ¿Está corriendo el servidor?`,
    );
  }

  if (!respuesta.ok) {
    let detalle = "";
    try {
      const cuerpo = await respuesta.json();
      detalle = cuerpo?.detail ? `: ${cuerpo.detail}` : "";
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new Error(`Error ${respuesta.status} al llamar ${ruta}${detalle}`);
  }

  return respuesta.json() as Promise<T>;
}

/** Lista los 83 distritos con datos resumidos. */
export function obtenerDistritos(): Promise<DistritoResumen[]> {
  return obtenerJson<DistritoResumen[]>("/distritos");
}

/**
 * Ficha completa de un distrito. El backend devuelve un string JSON
 * (GeoJSON serializado), por lo que hay que parsearlo dos veces.
 */
export async function obtenerDistrito(ubigeo: string): Promise<FeatureDistrito> {
  const crudo = await obtenerJson<string | { features: FeatureDistrito[] }>(
    `/distritos/${ubigeo}`,
  );
  const coleccion =
    typeof crudo === "string"
      ? (JSON.parse(crudo) as { features: FeatureDistrito[] })
      : crudo;
  return coleccion.features[0];
}

/** GeoJSON de los 83 distritos, coloreable por comunidad según el método. */
export function obtenerComunidades(
  metodo: MetodoComunidad,
): Promise<ColeccionComunidades> {
  return obtenerJson<ColeccionComunidades>(`/comunidades?metodo=${metodo}`);
}

/** Tamaño y composición de cada comunidad. */
export function obtenerResumenComunidades(
  metodo: MetodoComunidad,
): Promise<ResumenComunidad[]> {
  return obtenerJson<ResumenComunidad[]>(`/comunidades/resumen?metodo=${metodo}`);
}

/** Coordenadas t-SNE 2D de los embeddings, para el scatter plot. */
export function obtenerProyeccion(): Promise<PuntoProyeccion[]> {
  return obtenerJson<PuntoProyeccion[]>("/embeddings/proyeccion");
}

/** k distritos más parecidos a uno dado, calculado en vivo. */
export function obtenerSimilares(
  ubigeo: string,
  k = 5,
): Promise<DistritoSimilar[]> {
  return obtenerJson<DistritoSimilar[]>(`/embeddings/similares/${ubigeo}?k=${k}`);
}

/** Aristas del grafo de un tipo determinado. */
export function obtenerAristas(tipo: TipoArista): Promise<Arista[]> {
  return obtenerJson<Arista[]>(`/grafo/aristas?tipo=${tipo}`);
}

/** Vecinos de un distrito en cada fuente de arista. */
export function obtenerVecinos(ubigeo: string): Promise<VecinosNodo> {
  return obtenerJson<VecinosNodo>(`/grafo/nodo/${ubigeo}/vecinos`);
}

/** Corre inferencia en vivo del modelo con features modificados. */
export function simular(
  payload: EntradaSimulacion,
): Promise<ResultadoSimulacion> {
  return obtenerJson<ResultadoSimulacion>("/simular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
