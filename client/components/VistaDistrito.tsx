"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  ColeccionComunidades,
  DistritoSimilar,
  FeatureDistrito,
} from "@/types";
import {
  obtenerDistrito,
  obtenerSimilares,
  obtenerComunidades,
} from "@/lib/api";
import { capitalizar, formatearDecimal, formatearEntero } from "@/lib/formato";
import BadgeComunidad from "@/components/BadgeComunidad";
import GraficoGastoMef from "@/components/GraficoGastoMef";
import MapaCliente from "@/components/MapaCliente";
import { Cargando, ErrorEstado, Esqueleto } from "@/components/Estados";

/** Ficha completa de un distrito. */
export default function VistaDistrito({ ubigeo }: { ubigeo: string }) {
  const router = useRouter();
  const [feature, setFeature] = useState<FeatureDistrito | null>(null);
  const [similares, setSimilares] = useState<DistritoSimilar[] | null>(null);
  const [coleccion, setColeccion] = useState<ColeccionComunidades | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    obtenerDistrito(ubigeo)
      .then((datos) => activo && setFeature(datos))
      .catch((e: Error) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [ubigeo, intento]);

  // Similares y mini-mapa: secundarios, cargan en paralelo.
  useEffect(() => {
    let activo = true;
    setSimilares(null);
    obtenerSimilares(ubigeo, 5)
      .then((datos) => activo && setSimilares(datos))
      .catch(() => activo && setSimilares([]));
    obtenerComunidades("louvain")
      .then((datos) => activo && setColeccion(datos))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [ubigeo, intento]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
        <ErrorEstado mensaje={error} alReintentar={() => setIntento((n) => n + 1)} />
      </div>
    );
  }

  if (cargando || !feature) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
        <Cargando mensaje="Cargando ficha del distrito…" />
      </div>
    );
  }

  const p = feature.properties;

  const features: { etiqueta: string; valor: string }[] = [
    { etiqueta: "Población (2017)", valor: formatearEntero(p.poblacion_2017) },
    { etiqueta: "Provincia", valor: capitalizar(p.provincia) },
    {
      etiqueta: "Gasto MEF per cápita (2026)",
      valor: `S/ ${formatearEntero(p.gasto_mef_2026_per_capita)}`,
    },
    {
      etiqueta: "Gasto MEF promedio per cápita",
      valor: `S/ ${formatearEntero(p.gasto_mef_promedio_per_capita)}`,
    },
    {
      etiqueta: "IE activas / 1000 hab.",
      valor: formatearDecimal(p.ie_activas_per_1000hab),
    },
    {
      etiqueta: "Est. de salud / 1000 hab.",
      valor: formatearDecimal(p.establecimientos_salud_per_1000hab),
    },
    {
      etiqueta: "Densidad poblacional",
      valor: `${formatearEntero(p.densidad_poblacional)} hab/km²`,
    },
    { etiqueta: "Área", valor: `${formatearDecimal(p.area_km2)} km²` },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      {/* Migas de pan */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--texto-suave)] transition-colors hover:text-[var(--acento)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver al mapa
      </Link>

      {/* Cabecera */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {capitalizar(p.distrito)}
          </h1>
          <p className="mt-1 text-sm text-[var(--texto-suave)]">
            Provincia de {capitalizar(p.provincia)} · Ubigeo {p.ubigeo}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[var(--texto-suave)]">
              Louvain
            </span>
            <BadgeComunidad comunidad={p.comunidad_louvain} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[var(--texto-suave)]">
              GraphSAGE
            </span>
            <BadgeComunidad comunidad={p.cluster_graphsage} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Features */}
          <section className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
              Indicadores socioeconómicos
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              {features.map((f) => (
                <div key={f.etiqueta}>
                  <dt className="text-xs text-[var(--texto-suave)]">{f.etiqueta}</dt>
                  <dd className="mt-0.5 text-base font-semibold tabular-nums">
                    {f.valor}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Serie de gasto MEF */}
          <section className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
              Ejecución de gasto público MEF
            </h2>
            <p className="mb-4 text-xs text-[var(--texto-suave)]">
              Serie anual 2012–2026 (soles)
            </p>
            <GraficoGastoMef distrito={p} />
          </section>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Mini-mapa */}
          <section className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-3 shadow-sm">
            <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
              Ubicación
            </h2>
            <div className="h-56 overflow-hidden rounded-lg">
              {coleccion ? (
                <MapaCliente
                  coleccion={coleccion}
                  ubigeoResaltado={p.ubigeo}
                  alClickDistrito={(u) => router.push(`/distritos/${u}`)}
                />
              ) : (
                <Esqueleto className="h-full w-full" />
              )}
            </div>
          </section>

          {/* Distritos similares */}
          <section className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
              Distritos similares
            </h2>
            <p className="mb-4 mt-1 text-xs text-[var(--texto-suave)]">
              Los más parecidos según los embeddings del modelo (distancia
              euclidiana, calculada en vivo).
            </p>
            {similares === null ? (
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Esqueleto key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : similares.length === 0 ? (
              <p className="text-sm text-[var(--texto-suave)]">
                No se pudieron cargar los distritos similares.
              </p>
            ) : (
              <ul className="space-y-2">
                {similares.map((s, i) => (
                  <li key={s.ubigeo}>
                    <Link
                      href={`/distritos/${s.ubigeo}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--borde)] px-3 py-2 transition-colors hover:border-[var(--acento)] hover:bg-[var(--fondo)]"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--fondo)] text-xs font-semibold text-[var(--texto-suave)]">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium">
                          {capitalizar(s.distrito)}
                        </span>
                      </span>
                      <span className="text-xs tabular-nums text-[var(--texto-suave)]">
                        {formatearDecimal(s.distancia)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
