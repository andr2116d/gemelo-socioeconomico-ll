// Componentes de estado reutilizables: cargando, error y vacío.

/** Spinner simple centrado con mensaje opcional. */
export function Cargando({ mensaje = "Cargando…" }: { mensaje?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--texto-suave)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--borde)] border-t-[var(--acento)]" />
      <p className="text-sm">{mensaje}</p>
    </div>
  );
}

/** Mensaje de error con opción de reintento. */
export function ErrorEstado({
  mensaje,
  alReintentar,
}: {
  mensaje: string;
  alReintentar?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      <p className="max-w-md text-sm text-red-700 dark:text-red-300">{mensaje}</p>
      {alReintentar && (
        <button
          type="button"
          onClick={alReintentar}
          className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

/** Rectángulo animado de carga (skeleton). */
export function Esqueleto({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--borde)] ${className}`}
    />
  );
}
