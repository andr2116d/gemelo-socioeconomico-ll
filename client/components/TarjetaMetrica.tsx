interface Props {
  etiqueta: string;
  valor: string;
  detalle?: string;
  acento?: boolean;
}

/** Tarjeta compacta de una métrica clave (KPI). */
export default function TarjetaMetrica({ etiqueta, valor, detalle, acento }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        acento
          ? "border-[var(--acento)]/30 bg-[var(--acento)]/5"
          : "border-[var(--borde)] bg-[var(--superficie)]"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--texto-suave)]">
        {etiqueta}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{valor}</p>
      {detalle && (
        <p className="mt-0.5 text-xs text-[var(--texto-suave)]">{detalle}</p>
      )}
    </div>
  );
}
