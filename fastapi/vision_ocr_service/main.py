from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid

# Importações dos seus arquivos locais de IA separados
from blip_caption import gerar_legendas_completas
from ocr_processor import processar_documento

app = FastAPI(title="FastAPI Vision & OCR Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def salvar_temporariamente(file: UploadFile):
    filename = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return filename

@app.post("/gerar-legenda")
async def gerar_legenda(file: UploadFile = File(...)):
    caminho = salvar_temporariamente(file)
    try:
        legendas = gerar_legendas_completas(caminho)
        if os.path.exists(caminho):
            os.remove(caminho)
        return JSONResponse(content=legendas)
    except Exception as e:
        if os.path.exists(caminho):
            os.remove(caminho)
        return JSONResponse(content={"erro": str(e)}, status_code=500)

@app.post("/processar-documento")
async def processar_documento_api(frente: UploadFile = File(...), verso: UploadFile = File(...)):
    frente_path = salvar_temporariamente(frente)
    verso_path = salvar_temporariamente(verso)
    try:
        resultado = processar_documento(frente_path, verso_path)
        if os.path.exists(frente_path): os.remove(frente_path)
        if os.path.exists(verso_path): os.remove(verso_path)
        return JSONResponse(content=resultado)
    except Exception as e:
        if os.path.exists(frente_path): os.remove(frente_path)
        if os.path.exists(verso_path): os.remove(verso_path)
        return JSONResponse(content={"erro": str(e)}, status_code=500)