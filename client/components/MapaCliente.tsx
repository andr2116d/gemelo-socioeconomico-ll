"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type MapaComunidades from "@/components/MapaComunidades";
import { Cargando } from "@/components/Estados";

// Leaflet accede a `window`, por lo que el mapa NO puede renderizarse en el
// servidor. Se carga dinámicamente solo en el cliente.
const Mapa = dynamic(() => import("@/components/MapaComunidades"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Cargando mensaje="Cargando mapa…" />
    </div>
  ),
});

/** Envoltorio que expone MapaComunidades sin renderizado en servidor. */
export default function MapaCliente(props: ComponentProps<typeof MapaComunidades>) {
  return <Mapa {...props} />;
}
