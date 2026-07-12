# Gemelo Digital Socioeconómico de La Libertad — Frontend

Frontend en Next.js para explorar las comunidades socioeconómicas de los 83
distritos de la región La Libertad (Perú), detectadas con **GraphSAGE** (Graph
Neural Network) y **Louvain** sobre un grafo de distritos.

El objetivo es que el usuario *experimente* con el modelo de Machine Learning:
comparar métodos, explorar los embeddings y simular escenarios en vivo.

## Requisitos

- Node.js 18+
- El backend (FastAPI) corriendo. Por defecto en `http://localhost:8000`.

## Configuración

Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env.local
```

Ajusta `NEXT_PUBLIC_API_URL` si tu backend no está en `http://localhost:8000`.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Producción

```bash
npm run build
npm start
```

## Estructura

```
app/                      # Rutas (App Router)
  page.tsx                # / — Mapa principal + métricas
  distritos/[ubigeo]/     # Ficha de distrito
  comunidades/            # Comparador Louvain vs GraphSAGE
  embeddings/             # Explorador de embeddings (scatter t-SNE)
  simulador/              # Simulador "¿Qué pasaría si…?"
components/               # Componentes reutilizables (mapa, badges, etc.)
lib/
  api.ts                  # Cliente de API tipado (única puerta al backend)
  paleta.ts               # Colores de comunidad, consistentes en todas las vistas
  metricas.ts             # Índice de Rand Ajustado (ARI) en el cliente
  formato.ts              # Formateo numérico en español
  featuresSimulables.ts   # Metadatos de los sliders del simulador
types/                    # Tipos TypeScript de las respuestas del backend
```

## Notas

- Todo el código, comentarios y nombres están en español (convención del proyecto).
- Ningún componente hace `fetch` directo: todas las llamadas pasan por `lib/api.ts`.
- El mapa (Leaflet) se carga solo en el cliente (sin SSR).
- Las métricas de la landing incluyen el ARI real (calculado en el navegador).
  La silhouette es un valor de ejemplo: el backend aún no expone un endpoint
  de métricas (ver `TODO` en `components/VistaMapaPrincipal.tsx`).
