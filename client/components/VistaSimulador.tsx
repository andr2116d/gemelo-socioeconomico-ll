"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  DistritoResumen,
  FeatureDistrito,
  ResultadoSimulacion,
} from "@/types";
import { obtenerDistritos, obtenerDistrito, simular } from "@/lib/api";
import { capitalizar } from "@/lib/formato";
import { FEATURES_SIMULABLES } from "@/lib/featuresSimulables";
import { colorComunidad } from "@/lib/paleta";
import BadgeComunidad from "@/components/BadgeComunidad";
import { Cargando, ErrorEstado, Esqueleto } from "@/components/Estados";

/** Simulador "¿Qué pasaría si…?": inferencia en vivo del modelo GraphSAGE. */
export default function VistaSimulador() {
  const [distritos, setDistritos] = useState<DistritoResumen[] | null>(null);
  const [ubigeo, setUbigeo] = useState<string>("");
  const [ficha, setFicha] = useState<FeatureDistrito | null>(null);
  const [cargandoFicha, setCargandoFicha] = useState(false);
  const [valores, setValores] = useState<Record<string, number>>({});
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSimulacion | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSim, setErrorSim] = useState<string | null>(null);

  // Cargar el listado de distritos para el selector.
  useEffect(() => {
    let activo = true;
    obtenerDistritos()
      .then((datos) => {
        if (!activo) return;
        const ordenados = [...datos].sort((a, b) =>
          a.distrito.localeCompare(b.distrito),
        );
        setDistritos(ordenados);
        if (ordenados.length > 0) setUbigeo(ordenados[0].ubigeo);
      })
      .catch((e: Error) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, []);

  // Al cambiar de distrito: cargar su ficha y reiniciar los sliders a sus
  // valores reales.
  useEffect(() => {
    if (!ubigeo) return;
    let activo = true;
    setCargandoFicha(true);
    setResultado(null);
    setErrorSim(null);
    obtenerDistrito(ubigeo)
      .then((f) => {
        if (!activo) return;
        setFicha(f);
        const iniciales: Record<string, number> = {};
        for (const feat of FEATURES_SIMULABLES) {
          const valor = f.properties[feat.clave];
          iniciales[feat.clave] = typeof valor === "number" ? valor : 0;
        }
        setValores(iniciales);
      })
      .catch((e: Error) => activo && setError(e.message))
      .finally(() => activo && setCargandoFicha(false));
    return () => {
      activo = false;
    };
  }, [ubigeo]);

  // Valores reales de referencia (para saber qué features cambió el usuario).
  const valoresReales = useMemo(() => {
    if (!ficha) return {} as Record<string, number>;
    const reales: Record<string, number> = {};
    for (const feat of FEATURES_SIMULABLES) {
      const valor = ficha.properties[feat.clave];
      reales[feat.clave] = typeof valor === "number" ? valor : 0;
    }
    return reales;
  }, [ficha]);

  const cambios = FEATURES_SIMULABLES.filter(
    (f) => Math.abs((valores[f.clave] ?? 0) - (valoresReales[f.clave] ?? 0)) > 1e-9,
  );

  const ejecutarSimulacion = async () => {
    if (!ubigeo) return;
    setSimulando(true);
    setErrorSim(null);
    setResultado(null);
    try {
      // Solo enviamos los features que el usuario efectivamente modificó.
      const features_modificados: Record<string, number> = {};
      for (const f of cambios) features_modificados[f.clave] = valores[f.clave];
      const r = await simular({ ubigeo, features_modificados });
      setResultado(r);
    } catch (e) {
      setErrorSim((e as Error).message);
    } finally {
      setSimulando(false);
    }
  };

  const reiniciar = () => {
    setValores({ ...valoresReales });
    setResultado(null);
    setErrorSim(null);
  };

  const featuresPrincipales = FEATURES_SIMULABLES.filter((f) => !f.avanzado);
  const featuresAvanzados = FEATURES_SIMULABLES.filter((f) => f.avanzado);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
        <ErrorEstado mensaje={error} alReintentar={() => location.reload()} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Simulador · ¿Qué pasaría si…?
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--texto-suave)]">
          Modifica los indicadores de un distrito y el modelo GraphSAGE recalcula
          su embedding <strong>en vivo</strong> para predecir si cambiaría de
          comunidad. Por ejemplo: ¿qué pasa si un distrito duplicara su gasto
          público per cápita?
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Panel de controles */}
        <div className="lg:col-span-3 space-y-5">
          {/* Selector de distrito */}
          <div className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-sm">
            <label
              htmlFor="selector-distrito"
              className="mb-2 block text-sm font-medium"
            >
              Distrito
            </label>
            {distritos ? (
              <select
                id="selector-distrito"
                value={ubigeo}
                onChange={(e) => setUbigeo(e.target.value)}
                className="w-full rounded-lg border border-[var(--borde)] bg-[var(--fondo)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--acento)]"
              >
                {distritos.map((d) => (
                  <option key={d.ubigeo} value={d.ubigeo}>
                    {capitalizar(d.distrito)} — {capitalizar(d.provincia)}
                  </option>
                ))}
              </select>
            ) : (
              <Esqueleto className="h-11 w-full" />
            )}
          </div>

          {/* Sliders */}
          <div className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
                Indicadores simulables
              </h2>
              {cambios.length > 0 && (
                <button
                  type="button"
                  onClick={reiniciar}
                  className="text-xs font-medium text-[var(--acento)] hover:underline"
                >
                  Restablecer valores reales
                </button>
              )}
            </div>

            {cargandoFicha ? (
              <div className="space-y-5">
                {[0, 1, 2].map((i) => (
                  <Esqueleto key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {featuresPrincipales.map((f) => (
                  <ControlSlider
                    key={f.clave}
                    feature={f}
                    valor={valores[f.clave] ?? f.min}
                    valorReal={valoresReales[f.clave] ?? 0}
                    alCambiar={(v) =>
                      setValores((prev) => ({ ...prev, [f.clave]: v }))
                    }
                  />
                ))}

                {/* Avanzados */}
                <div className="border-t border-[var(--borde)] pt-4">
                  <button
                    type="button"
                    onClick={() => setMostrarAvanzado((v) => !v)}
                    className="flex w-full items-center justify-between text-sm font-medium text-[var(--texto-suave)] hover:text-[var(--texto)]"
                  >
                    <span>Indicadores avanzados ({featuresAvanzados.length})</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`transition-transform ${mostrarAvanzado ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {mostrarAvanzado && (
                    <div className="mt-5 space-y-5">
                      {featuresAvanzados.map((f) => (
                        <ControlSlider
                          key={f.clave}
                          feature={f}
                          valor={valores[f.clave] ?? f.min}
                          valorReal={valoresReales[f.clave] ?? 0}
                          alCambiar={(v) =>
                            setValores((prev) => ({ ...prev, [f.clave]: v }))
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={ejecutarSimulacion}
                disabled={simulando || cargandoFicha || !ubigeo}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--acento)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {simulando ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Simulando…
                  </>
                ) : (
                  "Simular"
                )}
              </button>
              <span className="text-xs text-[var(--texto-suave)]">
                {cambios.length === 0
                  ? "Sin cambios respecto a los valores reales"
                  : `${cambios.length} indicador${cambios.length > 1 ? "es" : ""} modificado${cambios.length > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>

        {/* Panel de resultado */}
        <div className="lg:col-span-2">
          <PanelResultado
            resultado={resultado}
            error={errorSim}
            simulando={simulando}
          />
        </div>
      </div>
    </div>
  );
}

/** Un slider individual con su etiqueta, valor actual y valor real de base. */
function ControlSlider({
  feature,
  valor,
  valorReal,
  alCambiar,
}: {
  feature: (typeof FEATURES_SIMULABLES)[number];
  valor: number;
  valorReal: number;
  alCambiar: (v: number) => void;
}) {
  const modificado = Math.abs(valor - valorReal) > 1e-9;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium">{feature.etiqueta}</label>
        <span
          className={`text-sm font-semibold tabular-nums ${modificado ? "text-[var(--acento)]" : ""}`}
        >
          {feature.formato(valor)}
        </span>
      </div>
      <input
        type="range"
        min={feature.min}
        max={feature.max}
        step={feature.paso}
        value={valor}
        onChange={(e) => alCambiar(Number(e.target.value))}
        className="w-full cursor-pointer accent-[var(--acento)]"
      />
      <div className="mt-0.5 flex items-center justify-between text-[11px] text-[var(--texto-suave)]">
        <span>{feature.descripcion}</span>
        {modificado && (
          <span className="whitespace-nowrap">
            real: {feature.formato(valorReal)}
          </span>
        )}
      </div>
    </div>
  );
}

/** Panel derecho que muestra el resultado de la simulación. */
function PanelResultado({
  resultado,
  error,
  simulando,
}: {
  resultado: ResultadoSimulacion | null;
  error: string | null;
  simulando: boolean;
}) {
  if (error) {
    return <ErrorEstado mensaje={error} />;
  }

  if (simulando) {
    return (
      <div className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-sm">
        <Cargando mensaje="Corriendo inferencia del modelo…" />
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--borde)] bg-[var(--superficie)] p-8 text-center">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--texto-suave)" strokeWidth="1.6">
          <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" strokeLinecap="round" />
        </svg>
        <p className="mt-3 text-sm text-[var(--texto-suave)]">
          Ajusta los indicadores y pulsa <strong>Simular</strong> para ver si el
          distrito cambiaría de comunidad.
        </p>
      </div>
    );
  }

  const cambio = resultado.cambio_de_comunidad;

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        cambio
          ? "border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-950/30"
          : "border-[var(--borde)] bg-[var(--superficie)]"
      }`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
        Resultado
      </h2>
      <p className="mt-1 text-lg font-semibold">{capitalizar(resultado.distrito)}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex-1 text-center">
          <p className="mb-1.5 text-[11px] uppercase tracking-wide text-[var(--texto-suave)]">
            Original
          </p>
          <BadgeComunidad comunidad={resultado.cluster_original} />
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--texto-suave)" strokeWidth="2" className="shrink-0">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex-1 text-center">
          <p className="mb-1.5 text-[11px] uppercase tracking-wide text-[var(--texto-suave)]">
            Simulado
          </p>
          <BadgeComunidad comunidad={resultado.cluster_simulado} />
        </div>
      </div>

      <div
        className={`mt-5 flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium ${
          cambio
            ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
            : "bg-[var(--fondo)] text-[var(--texto-suave)]"
        }`}
      >
        {cambio ? (
          <>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: colorComunidad(resultado.cluster_simulado) }}
            >
              !
            </span>
            <span>
              El distrito <strong>cambiaría</strong> de la comunidad{" "}
              {resultado.cluster_original} a la {resultado.cluster_simulado}.
            </span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>El distrito se mantendría en su comunidad actual.</span>
          </>
        )}
      </div>

      <Link
        href={`/distritos/${resultado.ubigeo}`}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--borde)] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
      >
        Ver ficha del distrito
      </Link>
    </div>
  );
}
