from fastapi import APIRouter, Query
from typing import Literal
from app.models import datos

router = APIRouter()


@router.get("")
def obtener_comunidades(metodo: Literal["louvain", "graphsage"] = Query(default="louvain")):
    """
    Devuelve el GeoJSON completo de los 83 distritos, coloreable por
    comunidad según el método elegido (para el toggle Louvain vs GraphSAGE
    en el frontend).
    """
    columna = "comunidad_louvain" if metodo == "louvain" else "cluster_graphsage"

    gdf = datos.gdf_nodos[["ubigeo", "distrito", "provincia", columna, "geometry"]].copy()
    gdf = gdf.rename(columns={columna: "comunidad"})

    return gdf.__geo_interface__


@router.get("/resumen")
def resumen_comunidades(metodo: Literal["louvain", "graphsage"] = Query(default="louvain")):
    """Tamaño y lista de distritos por comunidad (para un panel lateral de texto)."""
    columna = "comunidad_louvain" if metodo == "louvain" else "cluster_graphsage"

    resumen = (
        datos.gdf_nodos.groupby(columna)["distrito"]
        .apply(list)
        .reset_index()
        .rename(columns={columna: "comunidad", "distrito": "distritos"})
    )
    resumen["tamano"] = resumen["distritos"].apply(len)

    return resumen.to_dict(orient="records")