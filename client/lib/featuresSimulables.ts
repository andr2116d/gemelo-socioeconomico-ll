// Metadatos de los features que el modelo permite simular. Rangos derivados
// de los valores reales observados en los 83 distritos (con algo de holgura).

export interface FeatureSimulable {
  clave: string;
  etiqueta: string;
  descripcion: string;
  min: number;
  max: number;
  paso: number;
  /** Formatea el valor para mostrarlo junto al slider. */
  formato: (v: number) => string;
  /** Si es un feature avanzado (colapsado por defecto). */
  avanzado?: boolean;
}

export const FEATURES_SIMULABLES: FeatureSimulable[] = [
  {
    clave: "gasto_mef_promedio_per_capita",
    etiqueta: "Gasto MEF promedio per cápita",
    descripcion: "Gasto público promedio del periodo, por habitante.",
    min: 0,
    max: 20000,
    paso: 100,
    formato: (v) => `S/ ${Math.round(v).toLocaleString("es-PE")}`,
  },
  {
    clave: "ie_activas_per_1000hab",
    etiqueta: "IE activas por 1000 hab.",
    descripcion: "Instituciones educativas activas cada 1000 habitantes.",
    min: 0,
    max: 20,
    paso: 0.1,
    formato: (v) => v.toFixed(1),
  },
  {
    clave: "establecimientos_salud_per_1000hab",
    etiqueta: "Est. de salud por 1000 hab.",
    descripcion: "Establecimientos de salud cada 1000 habitantes.",
    min: 0,
    max: 3,
    paso: 0.05,
    formato: (v) => v.toFixed(2),
  },
  {
    clave: "tendencia_gasto_mef_per_capita",
    etiqueta: "Tendencia del gasto per cápita",
    descripcion: "Pendiente de crecimiento del gasto por habitante.",
    min: -300,
    max: 1300,
    paso: 10,
    formato: (v) => Math.round(v).toLocaleString("es-PE"),
    avanzado: true,
  },
  {
    clave: "proporcion_ie_inactivas",
    etiqueta: "Proporción de IE inactivas",
    descripcion: "Fracción de instituciones educativas inactivas (0 a 1).",
    min: 0,
    max: 1,
    paso: 0.01,
    formato: (v) => v.toFixed(2),
    avanzado: true,
  },
  {
    clave: "log_densidad_poblacional",
    etiqueta: "Log densidad poblacional",
    descripcion: "Logaritmo de la densidad de población.",
    min: 0,
    max: 11,
    paso: 0.1,
    formato: (v) => v.toFixed(2),
    avanzado: true,
  },
  {
    clave: "log_poblacion_2017",
    etiqueta: "Log población (2017)",
    descripcion: "Logaritmo de la población censal 2017.",
    min: 6,
    max: 14,
    paso: 0.1,
    formato: (v) => v.toFixed(2),
    avanzado: true,
  },
];
