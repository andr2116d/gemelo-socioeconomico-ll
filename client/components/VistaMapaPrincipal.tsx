"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ColeccionComunidades,
  DistritoResumen,
  MetodoComunidad,
} from "@/types";
import { obtenerComunidades, obtenerDistritos } from "@/lib/api";
import { indiceRandAjustado } from "@/lib/metricas";
import { nombreMetodo } from "@/lib/paleta";
import MapaCliente from "@/components/MapaCliente";
import SelectorMetodo from "@/components/SelectorMetodo";
import LeyendaComunidades from "@/components/LeyendaComunidades";
import TarjetaMetrica from "@/components/TarjetaMetrica";
import { Cargando, ErrorEstado } from "@/components/Estados";

/** Landing: mapa de los 83 distritos + toggle de método + métricas globales. */
export default function VistaMapaPrincipal() {
  const router = useRouter();
  const [metodo, setMetodo] = useState<MetodoComunidad>("louvain");
  const [coleccion, setColeccion] = useState<ColeccionComunidades | null>(null);
  const [distritos, setDistritos] = useState<DistritoResumen[] | null>(null);
  const [comunidadFiltrada, setComunidadFiltrada] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  // El GeoJSON depende del método elegido.
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    obtenerComunidades(metodo)
      .then((datos) => {
        if (activo) setColeccion(datos);
      })
      .catch((e: Error) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [metodo, intento]);

  // El listado de distritos (para las métricas) solo se carga una vez.
  useEffect(() => {
    let activo = true;
    obtenerDistritos()
      .then((datos) => activo && setDistritos(datos))
      .catch(() => {
        /* las métricas son secundarias; no bloquean el mapa */
      });
    return () => {
      activo = false;
    };
  }, [intento]);

  // Métricas comparativas
  const ari =
    distritos && distritos.length > 0
      ? indiceRandAjustado(
          distritos.map((d) => d.comunidad_louvain),
          distritos.map((d) => d.cluster_graphsage),
        )
      : null;

  const comunidadesPresentes = coleccion
    ? [...new Set(coleccion.features.map((f) => f.properties.comunidad))]
    : [];

  const numComunidadesMetodo = comunidadesPresentes.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      {/* Encabezado de la vista */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Comunidades socioeconómicas de La Libertad
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--texto-suave)]">
          83 distritos modelados como un grafo. Un modelo GraphSAGE aprende un
          embedding de cada distrito a partir de sus features socioeconómicos;
          aquí puedes comparar cómo lo agrupa <strong>Louvain</strong> (estructura
          del grafo) frente a <strong>GraphSAGE + KMeans</strong> (embeddings).
          Haz clic en un distrito para ver su ficha.
        </p>
      </div>

      {/* Métricas */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <TarjetaMetrica etiqueta="Distritos" valor="83" detalle="Región La Libertad" />
        <TarjetaMetrica
          etiqueta={`Comunidades · ${nombreMetodo(metodo)}`}
          valor={numComunidadesMetodo ? String(numComunidadesMetodo) : "—"}
          detalle="Grupos detectados"
        />
        <TarjetaMetrica
          etiqueta="ARI (acuerdo)"
          valor={ari != null ? ari.toFixed(3) : "—"}
          detalle="Louvain vs GraphSAGE"
          acento
        />
        {/* TODO: el backend no expone modularidad ni silhouette todavía.
            Cuando exista un endpoint de métricas, reemplazar este valor. */}
        <TarjetaMetrica
          etiqueta="Silhouette"
          valor="0.41"
          detalle="Valor de ejemplo (sin endpoint)"
        />
      </div>

      {/* Controles */}
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

      {/* Mapa */}
      <div className="h-[65vh] min-h-[420px] overflow-hidden rounded-xl border border-[var(--borde)] bg-[var(--superficie)] shadow-sm">
        {error ? (
          <div className="flex h-full items-center justify-center p-6">
            <ErrorEstado
              mensaje={error}
              alReintentar={() => setIntento((n) => n + 1)}
            />
          </div>
        ) : cargando || !coleccion ? (
          <div className="flex h-full items-center justify-center">
            <Cargando mensaje="Cargando distritos…" />
          </div>
        ) : (
          <MapaCliente
            coleccion={coleccion}
            comunidadFiltrada={comunidadFiltrada}
            alClickDistrito={(ubigeo) => router.push(`/distritos/${ubigeo}`)}
          />
        )}
      </div>
    </div>
  );
}
