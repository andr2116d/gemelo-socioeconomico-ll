"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ColeccionComunidades,
  MetodoComunidad,
  ResumenComunidad,
} from "@/types";
import { obtenerComunidades, obtenerResumenComunidades } from "@/lib/api";
import { capitalizar } from "@/lib/formato";
import { nombreMetodo } from "@/lib/paleta";
import MapaCliente from "@/components/MapaCliente";
import BadgeComunidad from "@/components/BadgeComunidad";
import { Cargando, ErrorEstado } from "@/components/Estados";

const DESCRIPCIONES: Record<MetodoComunidad, string> = {
  louvain:
    "Louvain agrupa los distritos mirando únicamente la estructura del grafo: qué distritos están conectados entre sí (por frontera, vías o similitud) y cuán densas son esas conexiones. Busca comunidades donde hay muchos lazos internos y pocos hacia afuera. No usa la red neuronal.",
  graphsage:
    "GraphSAGE es una red neuronal de grafos que aprende un vector (embedding) para cada distrito combinando sus features socioeconómicos con los de sus vecinos. Luego KMeans agrupa esos embeddings. Así, dos distritos pueden caer en la misma comunidad por ser parecidos, aunque no estén directamente conectados.",
};

interface DatosMetodo {
  coleccion: ColeccionComunidades;
  resumen: ResumenComunidad[];
}

/** Panel de un método: mapa + resumen de comunidades. */
function PanelMetodo({
  metodo,
  datos,
  alClickDistrito,
}: {
  metodo: MetodoComunidad;
  datos: DatosMetodo | null;
  alClickDistrito: (ubigeo: string) => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--borde)] bg-[var(--superficie)] shadow-sm">
      <div className="border-b border-[var(--borde)] p-4">
        <h2 className="text-lg font-semibold">{nombreMetodo(metodo)}</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--texto-suave)]">
          {DESCRIPCIONES[metodo]}
        </p>
      </div>
      <div className="h-[46vh] min-h-[320px] p-3">
        {datos ? (
          <MapaCliente
            coleccion={datos.coleccion}
            alClickDistrito={alClickDistrito}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Cargando mensaje="Cargando mapa…" />
          </div>
        )}
      </div>
      <div className="border-t border-[var(--borde)] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
          {datos ? `${datos.resumen.length} comunidades` : "Comunidades"}
        </h3>
        {datos ? (
          <ul className="space-y-2">
            {datos.resumen.map((c) => (
              <li key={c.comunidad} className="flex items-start gap-2.5">
                <BadgeComunidad comunidad={c.comunidad} tamano="sm" />
                <span className="flex-1 text-xs text-[var(--texto-suave)]">
                  <span className="font-medium text-[var(--texto)]">
                    {c.tamano} distritos ·{" "}
                  </span>
                  {c.distritos.map((d) => capitalizar(d)).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-[var(--borde)]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Comparador lado a lado de Louvain vs GraphSAGE. */
export default function VistaComparador() {
  const router = useRouter();
  const [louvain, setLouvain] = useState<DatosMetodo | null>(null);
  const [graphsage, setGraphsage] = useState<DatosMetodo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    setError(null);
    setLouvain(null);
    setGraphsage(null);

    const cargar = async (metodo: MetodoComunidad) => {
      const [coleccion, resumen] = await Promise.all([
        obtenerComunidades(metodo),
        obtenerResumenComunidades(metodo),
      ]);
      return { coleccion, resumen };
    };

    cargar("louvain")
      .then((d) => activo && setLouvain(d))
      .catch((e: Error) => activo && setError(e.message));
    cargar("graphsage")
      .then((d) => activo && setGraphsage(d))
      .catch((e: Error) => activo && setError(e.message));

    return () => {
      activo = false;
    };
  }, [intento]);

  const irADistrito = (ubigeo: string) => router.push(`/distritos/${ubigeo}`);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Comparador de métodos
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--texto-suave)]">
          Dos formas distintas de agrupar los mismos 83 distritos. Compara cómo
          cada método dibuja las fronteras entre comunidades socioeconómicas —
          las diferencias revelan qué captura la red neuronal que la pura
          estructura del grafo no ve.
        </p>
      </div>

      {error ? (
        <ErrorEstado mensaje={error} alReintentar={() => setIntento((n) => n + 1)} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <PanelMetodo metodo="louvain" datos={louvain} alClickDistrito={irADistrito} />
          <PanelMetodo
            metodo="graphsage"
            datos={graphsage}
            alClickDistrito={irADistrito}
          />
        </div>
      )}
    </div>
  );
}
