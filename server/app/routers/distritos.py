from fastapi import APIRouter, HTTPException
from app.models import datos

router = APIRouter()


@router.get("")
def listar_distritos():
    """Lista los 83 distritos con datos resumidos (para pintar el mapa inicial)."""
    columnas_resumen = [
        "ubigeo", "distrito", "provincia", "poblacion_2017",
        "gasto_mef_2026_per_capita", "ie_activas_per_1000hab",
        "comunidad_louvain", "cluster_graphsage",
    ]
    df = datos.gdf_nodos[columnas_resumen].copy()
    return df.to_dict(orient="records")


@router.get("/{ubigeo}")
def obtener_distrito(ubigeo: str):
    """Ficha completa de un distrito: todos sus features + geometría."""
    fila = datos.gdf_nodos[datos.gdf_nodos["ubigeo"] == ubigeo]
    if fila.empty:
        raise HTTPException(status_code=404, detail=f"Distrito con ubigeo '{ubigeo}' no encontrado")
    return fila.to_json()