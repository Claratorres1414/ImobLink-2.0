from fastapi import FastAPI, Body, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import os

AMBIENTE = os.getenv("AMBIENTE", "LOCAL")

if AMBIENTE == "PROD":
    app = FastAPI(
        title="FastAPI Inteligente - ML Recommendation & Ranking Engine",
        docs_url=None,  # Esconde o Swagger em produção
        redoc_url=None  # Esconde o Redoc em produção
    )
else:
    app = FastAPI(
        title="FastAPI Inteligente - ML Recommendation & Ranking Engine"
    )

# Importações atualizadas dos arquivos locais unificados
from recommender import recommend_with_ml
from model import (
    treinar_modelo_popularidade, 
    prever_post, 
    prever_feed, 
    treinar_modelo_recomendacao
)

app = FastAPI(title="FastAPI Inteligente - IA Popularidade & Recomendação")

JAVA_BACKEND_PROD = os.getenv("JAVA_BACKEND_URL", "http://localhost:8080")

ALLOWED_ORIGINS = [
    JAVA_BACKEND_PROD,         # URL do seu Spring Boot (Produção ou Local)
    "http://127.0.0.1:8080",   # Variação comum de localhost do Java
    "http://localhost:5173",   # Se você tiver algum frontend (Vite/React) testando direto
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS, # <-- Agora estritamente controlado
    allow_credentials=True,
    allow_methods=["*"],           # Permite POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

# ---------------------------------------------------------------------
# 📋 MODELOS DE VALIDAÇÃO DE DADOS (Pydantic)
# ---------------------------------------------------------------------
class Post(BaseModel):
    id: int
    description: str
    type: str
    avenue: str
    price: Optional[float] = 0
    street: Optional[str] = ""
    likedTimes: Optional[int] = 0
    views: Optional[int] = 0

class UserProfile(BaseModel):
    objective: Optional[str] = None
    propertyType: Optional[str] = None
    priceRange: Optional[str] = None

class RecommendationRequest(BaseModel):
    user_id: int
    posts: List[Post]
    user_interactions: List[int]
    user_profile: Optional[UserProfile] = None

class Interaction(BaseModel):
    user_id: int
    post_id: int


# ---------------------------------------------------------------------
# 📌 ROTAS DO MODELO 1: POPULARIDADE PRÉ-PUBLICAÇÃO
# ---------------------------------------------------------------------
@app.post("/treinar-popularidade")
async def treinar_pop(posts: list = Body(..., description="Lista de posts históricos para treinar o modelo")):
    try:
        resultado = treinar_modelo_popularidade(posts)
        return JSONResponse(content=resultado)
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/prever-popularidade")
async def prever_pop_unico(post: dict = Body(..., description="Post novo para prever popularidade")):
    try:
        resultado = prever_post(post)
        return resultado
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/prever-feed")
async def prever_pop_feed(posts: list = Body(..., description="Lista de posts novos para prever popularidade")):
    try:
        resultados = prever_feed(posts)
        return resultados
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)


# ---------------------------------------------------------------------
# 📌 ROTAS DO MODELO 2: RECOMENDAÇÃO PERSONALIZADA (NOVO!)
# ---------------------------------------------------------------------
@app.post("/treinar-recomendador")
async def treinar_rec(payload: list = Body(..., description="Histórico de interações do banco contendo {'user_profile':..., 'post':...}")):
    """
    Treina o modelo de Machine Learning que decide o ordenamento ideal do feed
    com base no histórico extraído do banco de dados do Java.
    """
    try:
        resultado = treinar_modelo_recomendacao(payload)
        return JSONResponse(content=resultado)
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/recommend")
async def get_recommendations(data: RecommendationRequest):
    """
    Mapeia os posts elegíveis e usa o cérebro de Regressão para ordenar o feed do usuário.
    """
    try:
        recs = recommend_with_ml(data.model_dump())
        return recs
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)


# ---------------------------------------------------------------------
# 📌 CONTROLE DE INTERAÇÕES (Armazenamento temporário local)
# ---------------------------------------------------------------------
user_interactions_db = {}

@app.post("/interaction")
async def register_interaction(data: Interaction):
    try:
        if data.user_id not in user_interactions_db:
            user_interactions_db[data.user_id] = []
        user_interactions_db[data.user_id].append(data.post_id)
        print("INTERAÇÃO SALVA:", data)
        return {"status": "ok"}
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)