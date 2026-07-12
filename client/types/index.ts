// Tipos TypeScript de las respuestas del backend (todos en español).

/** Método de detección de comunidades disponible. */
export type MetodoComunidad = "louvain" | "graphsage";

/** Tipo de arista del grafo. */
export type TipoArista = "frontera" | "vial" | "similitud";

/** Distrito resumido, como lo devuelve GET /distritos. */
export interface DistritoResumen {
  ubigeo: string;
  distrito: string;
  provincia: string;
  poblacion_2017: number;
  gasto_mef_2026_per_capita: number;
  ie_activas_per_1000hab: number;
  comunidad_louvain: number;
  cluster_graphsage: number;
}

/**
 * Propiedades completas de un distrito (properties del GeoJSON Feature
 * que devuelve GET /distritos/{ubigeo}). Incluye la serie temporal de
 * gasto MEF 2012-2026 y todos los features del modelo.
 */
export interface DistritoCompleto {
  ubigeo: string;
  departamento: string;
  provincia: string;
  capital: string;
  distrito: string;
  gasto_mef_2012: number;
  gasto_mef_2013: number;
  gasto_mef_2014: number;
  gasto_mef_2015: number;
  gasto_mef_2016: number;
  gasto_mef_2017: number;
  gasto_mef_2018: number;
  gasto_mef_2019: number;
  gasto_mef_2020: number;
  gasto_mef_2021: number;
  gasto_mef_2022: number;
  gasto_mef_2023: number;
  gasto_mef_2024: number;
  gasto_mef_2025: number;
  gasto_mef_2026: number;
  num_establecimientos_salud: number;
  num_ie_activas: number;
  num_ie_inactivas: number;
  num_ie_total: number;
  poblacion_2017: number;
  ie_activas_per_1000hab: number;
  establecimientos_salud_per_1000hab: number;
  gasto_mef_2026_per_capita: number;
  gasto_mef_promedio_periodo: number;
  gasto_mef_promedio_per_capita: number;
  log_gasto_mef_2026: number;
  log_poblacion_2017: number;
  tendencia_gasto_mef: number;
  tendencia_gasto_mef_per_capita: number;
  proporcion_ie_inactivas: number;
  area_km2: number;
  densidad_poblacional: number;
  log_densidad_poblacional: number;
  comunidad_louvain: number;
  cluster_graphsage: number;
  [clave: string]: number | string;
}

/** Geometría GeoJSON de un polígono o multipolígono. */
export interface Geometria {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

/** Feature GeoJSON de una comunidad (GET /comunidades). */
export interface FeatureComunidad {
  type: "Feature";
  properties: {
    ubigeo: string;
    distrito: string;
    provincia: string;
    comunidad: number;
  };
  geometry: Geometria;
}

/** FeatureCollection devuelto por GET /comunidades. */
export interface ColeccionComunidades {
  type: "FeatureCollection";
  features: FeatureComunidad[];
}

/** Feature GeoJSON de la ficha completa (GET /distritos/{ubigeo}). */
export interface FeatureDistrito {
  type: "Feature";
  properties: DistritoCompleto;
  geometry: Geometria;
}

/** Resumen de una comunidad (GET /comunidades/resumen). */
export interface ResumenComunidad {
  comunidad: number;
  distritos: string[];
  tamano: number;
}

/** Punto de la proyección t-SNE 2D (GET /embeddings/proyeccion). */
export interface PuntoProyeccion {
  ubigeo: string;
  tsne_x: number;
  tsne_y: number;
  distrito: string;
  comunidad_louvain: number;
  cluster_graphsage: number;
}

/** Distrito similar (GET /embeddings/similares/{ubigeo}). */
export interface DistritoSimilar {
  ubigeo: string;
  distrito: string;
  distancia: number;
}

/** Arista del grafo (GET /grafo/aristas). */
export interface Arista {
  ubigeo_origen: string;
  ubigeo_destino: string;
  distrito_origen: string;
  distrito_destino: string;
  tipo_arista: string;
  peso?: number;
}

/** Vecinos de un nodo por fuente de arista (GET /grafo/nodo/{ubigeo}/vecinos). */
export interface VecinosNodo {
  frontera: string[];
  vial: string[];
  similitud: string[];
}

/** Payload del simulador (POST /simular). */
export interface EntradaSimulacion {
  ubigeo: string;
  features_modificados: Record<string, number>;
}

/** Resultado del simulador (POST /simular). */
export interface ResultadoSimulacion {
  ubigeo: string;
  distrito: string;
  cluster_original: number;
  cluster_simulado: number;
  cambio_de_comunidad: boolean;
  embedding_simulado: number[];
}
