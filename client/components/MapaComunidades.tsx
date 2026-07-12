"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Layer, PathOptions, LeafletMouseEvent } from "leaflet";
import L from "leaflet";
import type { Feature, Geometry } from "geojson";
import type { ColeccionComunidades } from "@/types";
import { colorComunidad } from "@/lib/paleta";
import { capitalizar } from "@/lib/formato";

interface Props {
  coleccion: ColeccionComunidades;
  /** ubigeo del distrito resaltado (ficha, hover externo). */
  ubigeoResaltado?: string | null;
  /** Comunidad filtrada: las demás se atenúan. */
  comunidadFiltrada?: number | null;
  /** Callback al hacer click en un distrito. */
  alClickDistrito?: (ubigeo: string) => void;
  /** Altura CSS del contenedor del mapa. */
  altura?: string;
}

/** Ajusta la vista del mapa a los límites de la capa GeoJSON. */
function AjustarLimites({ coleccion }: { coleccion: ColeccionComunidades }) {
  const mapa = useMap();
  useEffect(() => {
    const capa = L.geoJSON(coleccion as unknown as GeoJSON.GeoJsonObject);
    const limites = capa.getBounds();
    if (limites.isValid()) {
      mapa.fitBounds(limites, { padding: [20, 20] });
    }
  }, [mapa, coleccion]);
  return null;
}

/**
 * Mapa Leaflet de los 83 distritos coloreados por comunidad. Reutilizable
 * en la landing, el comparador y la ficha de distrito.
 */
export default function MapaComunidades({
  coleccion,
  ubigeoResaltado,
  comunidadFiltrada,
  alClickDistrito,
  altura = "100%",
}: Props) {
  // Ref al callback más reciente para no recrear la capa GeoJSON en cada render.
  const clickRef = useRef(alClickDistrito);
  useEffect(() => {
    clickRef.current = alClickDistrito;
  }, [alClickDistrito]);

  const estilo = useMemo(
    () =>
      (feature?: Feature<Geometry, { ubigeo: string; comunidad: number }>): PathOptions => {
        const comunidad = feature?.properties?.comunidad ?? 0;
        const ubigeo = feature?.properties?.ubigeo;
        const resaltado = ubigeo === ubigeoResaltado;
        const atenuado =
          comunidadFiltrada != null && comunidad !== comunidadFiltrada;
        return {
          fillColor: colorComunidad(comunidad),
          fillOpacity: atenuado ? 0.12 : 0.72,
          color: resaltado ? "#0f172a" : "#ffffff",
          weight: resaltado ? 3 : 1,
          opacity: atenuado ? 0.3 : 1,
        };
      },
    [ubigeoResaltado, comunidadFiltrada],
  );

  const alCadaFeature = useMemo(
    () =>
      (
        feature: Feature<Geometry, { ubigeo: string; distrito: string; comunidad: number }>,
        capa: Layer,
      ) => {
        const { distrito, comunidad, ubigeo } = feature.properties;
        capa.bindTooltip(
          `<strong>${capitalizar(distrito)}</strong><br/>Comunidad ${comunidad}`,
          { sticky: true, direction: "top", opacity: 0.95 },
        );
        capa.on({
          click: () => clickRef.current?.(ubigeo),
          mouseover: (e: LeafletMouseEvent) => {
            (e.target as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.9 });
          },
          mouseout: (e: LeafletMouseEvent) => {
            const atenuado =
              comunidadFiltrada != null && comunidad !== comunidadFiltrada;
            (e.target as L.Path).setStyle({
              weight: ubigeo === ubigeoResaltado ? 3 : 1,
              fillOpacity: atenuado ? 0.12 : 0.72,
            });
          },
        });
      },
    [ubigeoResaltado, comunidadFiltrada],
  );

  // Clave que fuerza el re-montaje de la capa cuando cambian los estilos
  // (react-leaflet no re-evalúa el `style` de una capa GeoJSON ya montada).
  const claveCapa = useMemo(
    () =>
      `${coleccion.features.length}-${ubigeoResaltado ?? ""}-${
        comunidadFiltrada ?? ""
      }-${coleccion.features[0]?.properties.comunidad ?? ""}`,
    [coleccion, ubigeoResaltado, comunidadFiltrada],
  );

  return (
    <MapContainer
      center={[-8.1, -78.4]}
      zoom={8}
      scrollWheelZoom
      style={{ height: altura, width: "100%" }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <GeoJSON
        key={claveCapa}
        data={coleccion as unknown as GeoJSON.GeoJsonObject}
        style={estilo as PathOptions}
        onEachFeature={alCadaFeature as never}
      />
      <AjustarLimites coleccion={coleccion} />
    </MapContainer>
  );
}
