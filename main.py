from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from blip_caption import gerar_legendas_completas
from ocr_processor import processar_documento
import shutil
import os
import uuid

app = FastAPI()

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
        os.remove(caminho)
        return JSONResponse(content=legendas)
    except Exception as e:
        os.remove(caminho)
        return JSONResponse(content={"erro": str(e)}, status_code=500)

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
#python -m uvicorn main:app --reload
#http://127.0.0.1:8000/docs
