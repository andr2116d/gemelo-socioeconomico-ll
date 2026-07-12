"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DistritoCompleto } from "@/types";
import { formatearSoles } from "@/lib/formato";

/** Extrae la serie temporal gasto_mef_2012..2026 en formato para recharts. */
function construirSerie(distrito: DistritoCompleto) {
  const serie: { anio: string; gasto: number }[] = [];
  for (let anio = 2012; anio <= 2026; anio++) {
    const clave = `gasto_mef_${anio}`;
    const valor = distrito[clave];
    if (typeof valor === "number") {
      serie.push({ anio: String(anio), gasto: valor });
    }
  }
  return serie;
}

/** Gráfico de línea de la ejecución de gasto público MEF 2012-2026. */
export default function GraficoGastoMef({ distrito }: { distrito: DistritoCompleto }) {
  const datos = construirSerie(distrito);

  const formatoEjeY = (valor: number) => {
    if (valor >= 1_000_000_000) return `${(valor / 1_000_000_000).toFixed(1)} MM`;
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(0)} M`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)} K`;
    return String(valor);
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={datos} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" />
        <XAxis
          dataKey="anio"
          tick={{ fontSize: 11, fill: "var(--texto-suave)" }}
          stroke="var(--borde)"
        />
        <YAxis
          tickFormatter={formatoEjeY}
          tick={{ fontSize: 11, fill: "var(--texto-suave)" }}
          stroke="var(--borde)"
          width={48}
        />
        <Tooltip
          formatter={(valor) => [formatearSoles(Number(valor)), "Gasto MEF"]}
          labelFormatter={(etiqueta) => `Año ${etiqueta}`}
          contentStyle={{
            background: "var(--superficie)",
            border: "1px solid var(--borde)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--texto)",
          }}
        />
        <Line
          type="monotone"
          dataKey="gasto"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 2.5, fill: "#2563eb" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
