from fastapi import APIRouter, Query
from typing import Literal, Optional
from app.models import datos

router = APIRouter()


@router.get("/aristas")
def obtener_aristas(tipo: Optional[Literal["frontera", "vial", "similitud"]] = Query(default=None)):
    """
    Devuelve las aristas del grafo. Si no se especifica 'tipo', devuelve
    las 3 fuentes combinadas (útil para el grafo de red completo);
    si se especifica, solo esa fuente (útil para toggles de capa en el mapa).
    """
    if tipo == "frontera":
        return datos.aristas_frontera
    elif tipo == "vial":
        return datos.aristas_vial
    elif tipo == "similitud":
        return datos.aristas_similitud
    else:
        return {
            "frontera": datos.aristas_frontera,
            "vial": datos.aristas_vial,
            "similitud": datos.aristas_similitud,
        }


@router.get("/nodo/{ubigeo}/vecinos")
def vecinos_de_nodo(ubigeo: str):
    """Todos los vecinos de un distrito (en cualquiera de las 3 fuentes de arista)."""
    def buscar(lista_aristas):
        return [
            a["ubigeo_destino"] if a["ubigeo_origen"] == ubigeo else a["ubigeo_origen"]
            for a in lista_aristas
            if a["ubigeo_origen"] == ubigeo or a["ubigeo_destino"] == ubigeo
        ]

    return {
        "frontera": buscar(datos.aristas_frontera),
        "vial": buscar(datos.aristas_vial),
        "similitud": buscar(datos.aristas_similitud),
    }