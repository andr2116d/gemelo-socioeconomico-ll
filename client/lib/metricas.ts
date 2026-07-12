// Métricas comparativas entre métodos, calculadas en el cliente a partir
// de las asignaciones de comunidad de cada distrito.

/**
 * Índice de Rand Ajustado (ARI) entre dos particiones de las mismas
 * unidades. Mide cuánto coinciden Louvain y GraphSAGE al agrupar los
 * distritos: 1 = idénticas, 0 = coincidencia esperable por azar,
 * < 0 = peor que el azar.
 */
export function indiceRandAjustado(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  const etiquetasA = [...new Set(a)];
  const etiquetasB = [...new Set(b)];
  const indiceA = new Map(etiquetasA.map((e, i) => [e, i]));
  const indiceB = new Map(etiquetasB.map((e, i) => [e, i]));

  // Tabla de contingencia
  const contingencia: number[][] = etiquetasA.map(() =>
    new Array(etiquetasB.length).fill(0),
  );
  for (let i = 0; i < a.length; i++) {
    contingencia[indiceA.get(a[i])!][indiceB.get(b[i])!]++;
  }

  const comb2 = (n: number) => (n * (n - 1)) / 2;

  let sumaCeldas = 0;
  const sumasFila = new Array(etiquetasA.length).fill(0);
  const sumasColumna = new Array(etiquetasB.length).fill(0);

  for (let i = 0; i < etiquetasA.length; i++) {
    for (let j = 0; j < etiquetasB.length; j++) {
      const n = contingencia[i][j];
      sumaCeldas += comb2(n);
      sumasFila[i] += n;
      sumasColumna[j] += n;
    }
  }

  const sumaFilas = sumasFila.reduce((acc, n) => acc + comb2(n), 0);
  const sumaColumnas = sumasColumna.reduce((acc, n) => acc + comb2(n), 0);
  const total = comb2(a.length);

  const esperado = (sumaFilas * sumaColumnas) / total;
  const maximo = (sumaFilas + sumaColumnas) / 2;

  if (maximo - esperado === 0) return 0;
  return (sumaCeldas - esperado) / (maximo - esperado);
}
