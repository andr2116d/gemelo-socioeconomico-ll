# Gemelo Digital Socioeconómico de La Libertad — Backend

API que sirve los resultados del análisis de comunidades socioeconómicas de los 83 distritos de la región La Libertad, Perú, construido sobre un grafo de distritos con Graph Neural Networks (GraphSAGE) y detección de comunidades (Louvain).

Proyecto de curso — pipeline completo de Big Data, Machine Learning y Ciencia de Datos aplicado a datos abiertos del Estado Peruano.

---

## ¿Qué hace este proyecto?

Modela los 83 distritos de La Libertad como un grafo, donde:

- **Nodos** = distritos, con features socioeconómicos (gasto público 2012-2026, infraestructura educativa y de salud, población, densidad)
- **Aristas** = relaciones entre distritos por 3 criterios: frontera geográfica compartida, conectividad vial (red nacional/departamental/vecinal), y similitud socioeconómica (k-NN sobre embeddings)

Sobre ese grafo se entrena un modelo **GraphSAGE** que aprende embeddings de cada distrito, y se comparan dos métodos de detección de comunidades: **Louvain** (basado en la estructura del grafo) y **KMeans sobre los embeddings del GraphSAGE**.

Este backend expone esos resultados vía API REST, incluyendo un **simulador en tiempo real**: dado un distrito y un cambio hipotético en sus features (ej. "¿qué pasaría si Ascope duplicara su gasto per cápita?"), recalcula su embedding con el modelo ya entrenado y predice si cambiaría de comunidad.

## Arquitectura del proyecto completo

```
Ingesta (Colab)  →  Grafo + GNN (Colab)  →  Backend (FastAPI) → Frontend (Next.js)
6 fuentes         GraphSAGE +              este repo          Vercel
de datos          Louvain/KMeans           Railway
abiertos
```

Los datos y modelos se entrenan y exportan desde notebooks de Google Colab (fuera de este repo); este backend los carga como archivos estáticos y modelos serializados, y sirve inferencia en vivo sin necesitar reentrenar nada.

## Stack técnico

- **FastAPI** — framework de la API
- **PyTorch + PyTorch Geometric** — carga e inferencia del modelo GraphSAGE entrenado
- **scikit-learn** — KMeans, StandardScaler, k-NN para búsqueda de similares
- **GeoPandas** — manejo de geometría de los 83 distritos
- **Uvicorn** — servidor ASGI

## Fuentes de datos originales

| Fuente | Contenido |
|---|---|
| MEF (Consulta Amigable) | Ejecución de gasto público 2012-2026 |
| MINSA (IPRESS) | Establecimientos de salud |
| MINEDU (Padrón de IE) | Instituciones educativas |
| INEI / SIRTOD | Población censal 2017 |
| INEI | Límites distritales (geometría) |
| MTC | Red vial nacional, departamental y vecinal |

## Estructura del repositorio
```
gemelo-digital-backend/
├── app/
│   ├── main.py              # arranque de FastAPI y registro de routers
│   ├── models.py             # carga de datos y modelos ML en memoria al iniciar
│   └── routers/
│       ├── distritos.py      # ficha y listado de distritos
│       ├── comunidades.py    # comunidades (Louvain / GraphSAGE)
│       ├── grafo.py          # aristas del grafo (frontera / vial / similitud)
│       ├── embeddings.py     # proyección 2D y búsqueda de similares en vivo
│       └── simulacion.py     # simulador "¿qué pasaría si...?" con inferencia GNN
├── data/                     # datos exportados desde Colab (no versionados pesados)
├── requirements.txt
├── Procfile
└── README.md
```

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/distritos` | Lista los 83 distritos con datos resumidos |
| `GET` | `/distritos/{ubigeo}` | Ficha completa de un distrito |
| `GET` | `/comunidades?metodo=louvain\|graphsage` | GeoJSON coloreado por comunidad |
| `GET` | `/comunidades/resumen?metodo=...` | Tamaño y composición de cada comunidad |
| `GET` | `/grafo/aristas?tipo=frontera\|vial\|similitud` | Aristas del grafo |
| `GET` | `/grafo/nodo/{ubigeo}/vecinos` | Vecinos de un distrito en cada fuente de arista |
| `GET` | `/embeddings/proyeccion` | Coordenadas t-SNE 2D de los embeddings |
| `GET` | `/embeddings/similares/{ubigeo}?k=5` | k distritos más parecidos, calculado en vivo |
| `POST` | `/simular` | Recalcula el embedding y cluster con features modificados |

Documentación interactiva completa disponible en `/docs` (Swagger) una vez el servidor está corriendo.

### Ejemplo — simulador

```bash
curl -X POST http://localhost:8000/simular \
  -H "Content-Type: application/json" \
  -d '{
    "ubigeo": "130201",
    "features_modificados": {
      "gasto_mef_promedio_per_capita": 8000
    }
  }'
```

## Correr en local

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

python3 -m uvicorn app.main:app
```

La API queda disponible en `http://localhost:8000`, con documentación interactiva en `http://localhost:8000/docs`.

> **Nota:** la carpeta `data/` debe contener los 12 archivos exportados desde el notebook de Colab (nodos, aristas, embeddings, y los modelos serializados) antes de arrancar el servidor.

## Despliegue

Backend desplegado en **Railway**, conectado directo al repositorio de GitHub. El `Procfile` define el comando de arranque: web: uvicorn app.main:app --host 0.0.0.0 --port $PORT

Frontend (Next.js) desplegado por separado en **Vercel**, consumiendo esta API.

## Notas metodológicas y limitaciones conocidas

- **GraphFrames sobre PySpark 4.0.3**: incompatibilidad binaria detectada entre GraphFrames 0.8.3 (compilado para Scala/Spark 3.x) y Spark 4.x. Se usó **NetworkX** como alternativa para el ensamblaje y análisis del grafo.
- **Hadoop**: implementado en modo pseudo-distribuido (un solo nodo) en el entorno de Colab, con Spark leyendo directamente desde HDFS. El SecondaryNameNode no pudo levantarse por un problema de resolución SSH del hostname del contenedor; no afecta la funcionalidad de HDFS.
- **MIDAGRI (producción agropecuaria)**: se evaluaron múltiples fuentes públicas (SIEA, ENIS, portal de datos abiertos) y ninguna ofrece desagregación distrital confiable y consistente — la información disponible llega a nivel departamental. Se excluyó como feature del modelo; queda como trabajo futuro si se accede a microdatos.
- **ENAHO**: no se utilizó como fuente de indicadores de pobreza porque su diseño muestral no garantiza representatividad a nivel distrital.
- Los límites distritales del INEI usados son de carácter **censal/referencial**, no oficiales-demarcatorios.

## Autor

Johel Andreé — Trujillo, Perú