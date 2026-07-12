import { colorComunidad } from "@/lib/paleta";

interface Props {
  comunidades: number[];
  seleccionada?: number | null;
  alSeleccionar?: (comunidad: number | null) => void;
}

/** Leyenda de colores de comunidad, opcionalmente interactiva (filtro). */
export default function LeyendaComunidades({
  comunidades,
  seleccionada,
  alSeleccionar,
}: Props) {
  const interactiva = typeof alSeleccionar === "function";
  const ordenadas = [...comunidades].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap gap-1.5">
      {ordenadas.map((comunidad) => {
        const activa = seleccionada === comunidad;
        const atenuada = seleccionada != null && !activa;
        return (
          <button
            key={comunidad}
            type="button"
            disabled={!interactiva}
            onClick={() =>
              alSeleccionar?.(activa ? null : comunidad)
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              interactiva ? "cursor-pointer" : "cursor-default"
            } ${
              activa
                ? "border-[var(--acento)] bg-[var(--fondo)]"
                : "border-[var(--borde)]"
            } ${atenuada ? "opacity-40" : "opacity-100"}`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colorComunidad(comunidad) }}
            />
            {comunidad}
          </button>
        );
      })}
    </div>
  );
}
