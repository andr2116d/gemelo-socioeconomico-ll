import { colorComunidad } from "@/lib/paleta";

interface Props {
  comunidad: number;
  etiqueta?: string;
  tamano?: "sm" | "md";
}

/** Píldora de color + número de comunidad. Mismo color en todas las vistas. */
export default function BadgeComunidad({ comunidad, etiqueta, tamano = "md" }: Props) {
  const color = colorComunidad(comunidad);
  const dim = tamano === "sm" ? "text-xs px-2 py-0.5 gap-1.5" : "text-sm px-2.5 py-1 gap-2";
  const punto = tamano === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${dim}`}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span
        className={`rounded-full ${punto}`}
        style={{ backgroundColor: color }}
      />
      {etiqueta ?? `Comunidad ${comunidad}`}
    </span>
  );
}
