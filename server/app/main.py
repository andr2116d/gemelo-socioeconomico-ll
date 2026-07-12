from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import datos  # fuerza la carga de datos/modelos al importar
from app.routers import distritos, comunidades, grafo, embeddings, simulacion

app = FastAPI(
    title="Gemelo Digital Socioeconómico - La Libertad",
    description="API para explorar comunidades socioeconómicas de los 83 distritos de La Libertad, Perú",
    version="1.0.0",
)

# CORS: necesario para que el frontend en Next.js (dominio distinto en producción)
# pueda hacer requests a esta API sin que el navegador los bloquee
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en producción, restringir al dominio real de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(distritos.router, prefix="/distritos", tags=["Distritos"])
app.include_router(comunidades.router, prefix="/comunidades", tags=["Comunidades"])
app.include_router(grafo.router, prefix="/grafo", tags=["Grafo"])
app.include_router(embeddings.router, prefix="/embeddings", tags=["Embeddings"])
app.include_router(simulacion.router, prefix="/simular", tags=["Simulación"])


@app.get("/")
def raiz():
    return {
        "proyecto": "Gemelo Digital Socioeconómico de La Libertad",
        "distritos": len(datos.gdf_nodos),
        "endpoints": ["/distritos", "/comunidades", "/grafo", "/embeddings", "/simular", "/docs"],
    }