"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { MetodoComunidad, PuntoProyeccion } from "@/types";
import { obtenerProyeccion } from "@/lib/api";
import { colorComunidad } from "@/lib/paleta";
import { capitalizar } from "@/lib/formato";
import SelectorMetodo from "@/components/SelectorMetodo";
import LeyendaComunidades from "@/components/LeyendaComunidades";
import BadgeComunidad from "@/components/BadgeComunidad";
import { Cargando, ErrorEstado } from "@/components/Estados";

/** Devuelve el número de comunidad de un punto según el método activo. */
function comunidadDe(punto: PuntoProyeccion, metodo: MetodoComunidad): number {
  return metodo === "louvain" ? punto.comunidad_louvain : punto.cluster_graphsage;
}

/** Explorador interactivo de los embeddings proyectados a 2D (t-SNE). */
export default function VistaEmbeddings() {
  const [puntos, setPuntos] = useState<PuntoProyeccion[] | null>(null);
  const [metodo, setMetodo] = useState<MetodoComunidad>("louvain");
  const [comunidadFiltrada, setComunidadFiltrada] = useState<number | null>(null);
  const [seleccionado, setSeleccionado] = useState<PuntoProyeccion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    setError(null);
    setPuntos(null);
    obtenerProyeccion()
      .then((datos) => activo && setPuntos(datos))
      .catch((e: Error) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, [intento]);

  // Agrupa los puntos por comunidad para pintar una serie por color.
  const grupos = useMemo(() => {
    if (!puntos) return [];
    const mapa = new Map<number, PuntoProyeccion[]>();
    for (const punto of puntos) {
      const c = comunidadDe(punto, metodo);
      if (!mapa.has(c)) mapa.set(c, []);
      mapa.get(c)!.push(punto);
    }
    return [...mapa.entries()].sort((a, b) => a[0] - b[0]);
  }, [puntos, metodo]);

  const comunidadesPresentes = grupos.map(([c]) => c);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Explorador de embeddings
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--texto-suave)]">
          Cada punto es un distrito, ubicado según su embedding del modelo
          GraphSAGE proyectado a 2D con t-SNE. Los distritos cercanos son
          socioeconómicamente parecidos <em>para el modelo</em>. Colorea por el
          método que quieras y haz clic en un punto para ver su distrito.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SelectorMetodo valor={metodo} alCambiar={setMetodo} />
        {comunidadesPresentes.length > 0 && (
          <LeyendaComunidades
            comunidades={comunidadesPresentes}
            seleccionada={comunidadFiltrada}
            alSeleccionar={setComunidadFiltrada}
          />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-4 shadow-sm">
          <div className="h-[60vh] min-h-[420px]">
            {error ? (
              <div className="flex h-full items-center justify-center">
                <ErrorEstado
                  mensaje={error}
                  alReintentar={() => setIntento((n) => n + 1)}
                />
              </div>
            ) : !puntos ? (
              <div className="flex h-full items-center justify-center">
                <Cargando mensaje="Cargando proyección…" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 12, bottom: 12, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" />
                  <XAxis
                    type="number"
                    dataKey="tsne_x"
                    name="t-SNE X"
                    tick={{ fontSize: 11, fill: "var(--texto-suave)" }}
                    stroke="var(--borde)"
                  />
                  <YAxis
                    type="number"
                    dataKey="tsne_y"
                    name="t-SNE Y"
                    tick={{ fontSize: 11, fill: "var(--texto-suave)" }}
                    stroke="var(--borde)"
                  />
                  <ZAxis range={[70, 71]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as PuntoProyeccion;
                      return (
                        <div className="rounded-lg border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2 text-xs shadow-md">
                          <p className="font-semibold">{capitalizar(d.distrito)}</p>
                          <p className="text-[var(--texto-suave)]">
                            Comunidad {comunidadDe(d, metodo)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  {grupos.map(([comunidad, datos]) => {
                    const atenuado =
                      comunidadFiltrada != null && comunidad !== comunidadFiltrada;
                    return (
                      <Scatter
                        key={comunidad}
                        name={`Comunidad ${comunidad}`}
                        data={datos}
                        fill={colorComunidad(comunidad)}
                        fillOpacity={atenuado ? 0.15 : 0.85}
                        onClick={(punto) =>
                          setSeleccionado(punto as unknown as PuntoProyeccion)
                        }
                        className="cursor-pointer"
                      />
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Panel de detalle del punto seleccionado */}
        <div className="rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
            Distrito seleccionado
          </h2>
          {seleccionado ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xl font-semibold">
                  {capitalizar(seleccionado.distrito)}
                </p>
                <p className="text-xs text-[var(--texto-suave)]">
                  Ubigeo {seleccionado.ubigeo}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-[var(--texto-suave)]">
                    Louvain
                  </p>
                  <BadgeComunidad comunidad={seleccionado.comunidad_louvain} />
                </div>
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-[var(--texto-suave)]">
                    GraphSAGE
                  </p>
                  <BadgeComunidad comunidad={seleccionado.cluster_graphsage} />
                </div>
              </div>
              <Link
                href={`/distritos/${seleccionado.ubigeo}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--acento)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Ver ficha completa
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--texto-suave)]">
              Haz clic en cualquier punto del gráfico para ver a qué distrito
              corresponde y en qué comunidad cae con cada método.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
