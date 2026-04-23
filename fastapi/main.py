from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from blip_caption import gerar_legendas_completas
from recommender import recommend
from ocr_processor import processar_documento
from model import treinar_modelo, prever_post, prever_feed
import shutil
import os
import uuid
from fastapi import FastAPI, Body, Request
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou coloca "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],  # MUITO IMPORTANTE (inclui OPTIONS)
    allow_headers=["*"],
)

class Post(BaseModel):
    id: int
    description: str
    type: str
    avenue: str

class RecommendationRequest(BaseModel):
    user_id: int
    posts: List[Post]
    user_interactions: List[int]

def salvar_temporariamente(file: UploadFile):
    filename = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return filename

# ----------------------------
# 📌 1. GERAR LEGENDA
# ----------------------------
@app.post("/gerar-legenda")
async def gerar_legenda(file: UploadFile = File(...)):
    caminho = salvar_temporariamente(file)
    try:
        legendas = gerar_legendas_completas(caminho)
        os.remove(caminho)
        return JSONResponse(content=legendas)
    except Exception as e:
        os.remove(caminho)
        return JSONResponse(content={"erro": str(e)}, status_code=500)

# ----------------------------
# 📌 2. PROCESSAR DOCUMENTO
# ----------------------------
@app.post("/processar-documento")
async def processar_documento_api(frente: UploadFile = File(...), verso: UploadFile = File(...)):
    frente_path = salvar_temporariamente(frente)
    verso_path = salvar_temporariamente(verso)
    try:
        resultado = processar_documento(frente_path, verso_path)
        os.remove(frente_path)
        os.remove(verso_path)
        return JSONResponse(content=resultado)
    except Exception as e:
        os.remove(frente_path)
        os.remove(verso_path)
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/treinar-popularidade")
async def treinar(posts: list = Body(..., description="Lista de posts históricos para treinar o modelo")):
    """
    Recebe lista de posts históricos e treina o modelo de regressão para prever popularidade.
    """
    try:
        resultado = treinar_modelo(posts)
        return resultado
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

# ----------------------------
# Prever popularidade de um único post novo
# ----------------------------
@app.post("/prever-popularidade")
async def prever(post: dict = Body(..., description="Post novo para prever popularidade")):
    """
    Recebe um post novo e devolve a previsão de popularidade.
    """
    try:
        resultado = prever_post(post)
        return resultado
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)

# ----------------------------
# Prever popularidade de vários posts novos
# ----------------------------
@app.post("/prever-feed")
async def prever_feed_endpoint(posts: list = Body(..., description="Lista de posts novos para prever popularidade")):
    """
    Recebe uma lista de posts novos e devolve a previsão de popularidade de cada um.
    """
    try:
        resultados = prever_feed(posts)
        return resultados
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)
    

@app.post("/recommend")
async def get_recommendations(data: RecommendationRequest):
    recs = recommend(data.dict())
    
    return recs


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



#python -m uvicorn main:app --reload
#http://127.0.0.1:8000/docs
