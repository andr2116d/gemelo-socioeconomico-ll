from fastapi import APIRouter, HTTPException, Query
from sklearn.neighbors import NearestNeighbors
import numpy as np
from app.models import datos

router = APIRouter()


@router.get("/proyeccion")
def obtener_proyeccion_2d():
    """Coordenadas t-SNE de los 83 distritos, para el scatter interactivo."""
    return datos.embeddings_proyeccion


@router.get("/similares/{ubigeo}")
def distritos_similares(ubigeo: str, k: int = Query(default=5, ge=1, le=20)):
    """
    k distritos más similares a uno dado, calculado EN VIVO sobre los
    embeddings ya entrenados (no precalculado -- responde a cualquier k).
    """
    columnas_emb = [c for c in datos.df_embeddings.columns if c.startswith("emb_")]
    df = datos.df_embeddings

    if ubigeo not in df["ubigeo"].values:
        raise HTTPException(status_code=404, detail=f"Distrito '{ubigeo}' no encontrado")

    X = df[columnas_emb].values
    idx_objetivo = df.index[df["ubigeo"] == ubigeo][0]

    nn = NearestNeighbors(n_neighbors=k + 1, metric="euclidean")
    nn.fit(X)
    distancias, indices = nn.kneighbors([X[idx_objetivo]])

    resultados = []
    for dist, idx in zip(distancias[0][1:], indices[0][1:]):  # se salta el propio nodo
        fila = df.iloc[idx]
        nombre = datos.gdf_nodos.loc[datos.gdf_nodos["ubigeo"] == fila["ubigeo"], "distrito"].values[0]
        resultados.append({"ubigeo": fila["ubigeo"], "distrito": nombre, "distancia": float(dist)})

    return resultados