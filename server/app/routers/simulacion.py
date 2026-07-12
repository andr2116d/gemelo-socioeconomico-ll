from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
from app.models import datos

router = APIRouter()


class SimulacionInput(BaseModel):
    ubigeo: str
    features_modificados: dict[str, float]  # ej. {"gasto_mef_promedio_per_capita": 5000.0}


@router.post("")
def simular(entrada: SimulacionInput):
    if entrada.ubigeo not in datos.orden_ubigeos:
        raise HTTPException(status_code=404, detail=f"Distrito '{entrada.ubigeo}' no encontrado")

    idx_nodo = datos.orden_ubigeos.index(entrada.ubigeo)

    # partir de los features REALES del distrito, y sobreescribir solo
    # los que el usuario está simulando (el resto queda igual)
    fila_real = datos.gdf_nodos[datos.gdf_nodos["ubigeo"] == entrada.ubigeo].iloc[0]
    vector_features = []
    for nombre_feature in datos.features_gnn_orden:
        valor = entrada.features_modificados.get(nombre_feature, fila_real[nombre_feature])
        vector_features.append(valor)

    # estandarizar con el MISMO scaler que se usó en entrenamiento
    vector_escalado = datos.scaler.transform([vector_features])[0]

    # reconstruir la matriz de features de TODOS los nodos (los otros 82
    # quedan con su valor real, solo cambiamos el nodo simulado), porque
    # GraphSAGE necesita el vecindario completo para el forward pass
    X_todos = datos.gdf_nodos.set_index("ubigeo").loc[datos.orden_ubigeos, datos.features_gnn_orden].values
    X_todos_escalado = datos.scaler.transform(X_todos)
    X_todos_escalado[idx_nodo] = vector_escalado

    x_tensor = torch.tensor(X_todos_escalado, dtype=torch.float)

    with torch.no_grad():
        embeddings_nuevos = datos.modelo_graphsage(x_tensor, datos.edge_index)

    embedding_nodo_simulado = embeddings_nuevos[idx_nodo].numpy().reshape(1, -1)

    # cluster original vs. cluster tras la simulación
    cluster_original = int(fila_real["cluster_graphsage"])
    cluster_nuevo = int(datos.kmeans.predict(embedding_nodo_simulado)[0])

    return {
        "ubigeo": entrada.ubigeo,
        "distrito": fila_real["distrito"],
        "cluster_original": cluster_original,
        "cluster_simulado": cluster_nuevo,
        "cambio_de_comunidad": cluster_original != cluster_nuevo,
        "embedding_simulado": embedding_nodo_simulado.flatten().tolist(),
    }