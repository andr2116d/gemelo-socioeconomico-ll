# ============================================================
# app/models.py - Carga de datos y modelos ML al arrancar el servidor
# ============================================================

import json
import pickle
from pathlib import Path

import geopandas as gpd
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


# --- Misma arquitectura que usamos en Colab, necesaria para cargar los pesos ---
class GraphSAGE(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)  # sin dropout en inferencia
        return x


class DatosYModelos:
    """Contenedor único de todo lo cargado en memoria al iniciar el servidor."""

    def __init__(self):
        print("Cargando datos y modelos...")

        # --- Datos geoespaciales y tabulares ---
        self.gdf_nodos = gpd.read_file(DATA_DIR / "nodos.geojson")

        with open(DATA_DIR / "aristas_frontera.json") as f:
            self.aristas_frontera = json.load(f)
        with open(DATA_DIR / "aristas_vial.json") as f:
            self.aristas_vial = json.load(f)
        with open(DATA_DIR / "aristas_similitud.json") as f:
            self.aristas_similitud = json.load(f)

        with open(DATA_DIR / "embeddings_proyeccion_2d.json") as f:
            self.embeddings_proyeccion = json.load(f)

        # pd.read_json infiere tipos automáticamente y convierte 'ubigeo'
        # a entero (pierde el string original) -- se fuerza de vuelta a str
        self.df_embeddings = pd.read_json(DATA_DIR / "embeddings_completos.json")
        self.df_embeddings["ubigeo"] = self.df_embeddings["ubigeo"].astype(str).str.zfill(6)

        with open(DATA_DIR / "orden_ubigeos.json") as f:
            self.orden_ubigeos = json.load(f)
        with open(DATA_DIR / "features_gnn_orden.json") as f:
            self.features_gnn_orden = json.load(f)

        # --- Modelos ML ---
        with open(DATA_DIR / "scaler.pkl", "rb") as f:
            self.scaler = pickle.load(f)
        with open(DATA_DIR / "kmeans_model.pkl", "rb") as f:
            self.kmeans = pickle.load(f)

        self.edge_index = torch.load(DATA_DIR / "grafo_edge_index.pt", weights_only=True)

        self.modelo_graphsage = GraphSAGE(
            in_channels=len(self.features_gnn_orden),
            hidden_channels=32,
            out_channels=16,
        )
        self.modelo_graphsage.load_state_dict(
            torch.load(DATA_DIR / "graphsage_model.pt", weights_only=True)
        )
        self.modelo_graphsage.eval()  # modo inferencia, no entrenamiento

        print(f"Listo: {len(self.gdf_nodos)} distritos cargados.")


# instancia única, se crea al importar este módulo (una sola vez por proceso)
datos = DatosYModelos()