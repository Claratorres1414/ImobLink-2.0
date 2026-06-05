from fastapi import FastAPI, Body, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# Importações dos seus arquivos locais separados
from recommender import recommend
from model import treinar_modelo, prever_post, prever_feed

app = FastAPI(title="FastAPI ML & Ranking Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/treinar-popularidade")
async def treinar(posts: list = Body(..., description="Lista de posts históricos para treinar o modelo")):
    try:
        resultado = treinar_modelo(posts)
        return resultado
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/prever-popularidade")
async def prever(post: dict = Body(..., description="Post novo para prever popularidade")):
    try:
        resultado = prever_post(post)
        return resultado
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/prever-feed")
async def prever_feed_endpoint(posts: list = Body(..., description="Lista de posts novos para prever popularidade")):
    try:
        resultados = prever_feed(posts)
        return resultados
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/recommend")
async def get_recommendations(data: RecommendationRequest):
    try:
        recs = recommend(data.dict())
        return recs
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

user_interactions_db = {}

class Interaction(BaseModel):
    user_id: int
    post_id: int

@app.post("/interaction")
async def register_interaction(data: Interaction):
    if data.user_id not in user_interactions_db:
        user_interactions_db[data.user_id] = []
    user_interactions_db[data.user_id].append(data.post_id)
    print("INTERAÇÃO SALVA:", data)
    return {"status": "ok"}