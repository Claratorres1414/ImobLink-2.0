import os
import requests
from PIL import Image
import torch
from torchvision import models, transforms
from dotenv import load_dotenv
from transformers import BlipProcessor, BlipForConditionalGeneration

# ----------------------------
# 1. Token vindo da sua API Java
# ----------------------------
load_dotenv()

def obter_token():
    try:
        resposta = requests.get("http://localhost:5001/token?auth=subarutoken123")
        if resposta.status_code == 200:
            data = resposta.json()
            return data.get("token")
        else:
            print(f"Erro ao obter token: {resposta.status_code}")
            return None
    except Exception as e:
        print(f"Erro de conexão ao obter token: {e}")
        return None

HUGGINGFACE_API_TOKEN = obter_token()
if not HUGGINGFACE_API_TOKEN:
    raise RuntimeError("Token não obtido da API Java")

# ----------------------------
# 2. Inicializa modelo BLIP
# ----------------------------
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# ----------------------------
# 3. Inicializa ResNet para validação de casas
# ----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

resnet = models.resnet50(pretrained=True)
resnet.eval()

# Labels do ImageNet
LABELS_URL = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
labels = requests.get(LABELS_URL).text.split("\n")

house_keywords = ["house", "home", "building", "palace", "monastery", "mansion"]

def is_house(image_path: str) -> bool:
    """Verifica se a imagem representa uma casa usando ResNet."""
    img = Image.open(image_path).convert("RGB")
    img_t = transform(img).unsqueeze(0)

    with torch.no_grad():
        out = resnet(img_t)
        _, index = torch.max(out, 1)

    predicted_label = labels[index]
    print(f"[ResNet] Classe detectada: {predicted_label}")
    return any(word in predicted_label.lower() for word in house_keywords)

# ----------------------------
# 4. Funções de legenda e tradução
# ----------------------------
def gerar_legenda_blip(caminho_imagem: str, max_length=300) -> str:
    imagem = Image.open(caminho_imagem).convert("RGB")
    inputs = processor(images=imagem, return_tensors="pt")

    with torch.no_grad():
        output = blip_model.generate(
            **inputs,
            max_length=max_length,
            num_beams=5,
            no_repeat_ngram_size=2,
            early_stopping=True
        )

    legenda_ingles = processor.decode(output[0], skip_special_tokens=True)
    return legenda_ingles.strip()

def traduzir_para_portugues(texto_ingles: str) -> str:
    url = "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-tc-big-en-pt"
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {"inputs": texto_ingles}
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        try:
            traducao = response.json()[0]["translation_text"]
            return traducao
        except Exception as e:
            return f"[Erro ao processar resposta da tradução: {e}]"
    else:
        return f"[Erro na tradução: {response.status_code} - {response.text}]"

# ----------------------------
# 5. Pipeline completo
# ----------------------------
def gerar_legendas_completas(caminho_imagem: str) -> dict:
    """
    Gera legenda para imagem se for uma casa.
    Retorna dicionário com legenda em inglês e português.
    """
    if not is_house(caminho_imagem):
        return {"erro": "Imagem rejeitada: não parece ser uma casa."}

    legenda_en = gerar_legenda_blip(caminho_imagem)
    legenda_pt = traduzir_para_portugues(legenda_en)
    return {"legenda_en": legenda_en, "legenda_pt": legenda_pt}

# ----------------------------
# 6. Teste local opcional
# ----------------------------
if __name__ == "__main__":
    teste_imagem = "exemplo.jpg"  # substitua pelo caminho da sua imagem de teste
    resultado = gerar_legendas_completas(teste_imagem)
    print(resultado)
