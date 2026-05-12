import os
import requests
from PIL import Image
import torch
from torchvision import models, transforms
from dotenv import load_dotenv
from transformers import BlipProcessor, BlipForConditionalGeneration
from deep_translator import GoogleTranslator  # ✅ TROCA AQUI

load_dotenv()
# ----------------------------
# 2. Inicializa modelo BLIP
# ----------------------------
try:
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
except:
    processor = None
    print("⚠️ Modelo não carregado")

blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

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

# Função de checagem doméstica
def is_house(image_path: str) -> bool:
    img = Image.open(image_path).convert("RGB")
    img_t = transform(img).unsqueeze(0)

    with torch.no_grad():
        out = resnet(img_t)
        _, index = torch.max(out, 1)

    predicted_label = labels[index]
    label_lower = predicted_label.lower()
    print(f"[ResNet] Classe detectada: {predicted_label}")

    exterior_keywords = [
        "house", "home", "building", "palace", "monastery", "mansion", "villa",
        "cottage", "farmhouse", "residence", "patio", "porch", "driveway",
        "lawn", "garage", "yard", "roof", "chimney", "veranda", "gazebo",
        "carport", "garden", "terrace", "deck"
    ]

    interior_keywords = [
        "room", "living room", "bedroom", "kitchen", "bathroom",
        "dining room", "interior", "hallway", "office", "sofa",
        "furniture", "lamp", "ceiling", "floor", "window", "door"
    ]

    if any(word in label_lower for word in exterior_keywords + interior_keywords):
        return True

    legenda_blip = gerar_legenda_blip(image_path).lower()
    domestic_terms = [
        "house", "home", "yard", "garden", "kitchen", "living room",
        "sofa", "bedroom", "interior", "window", "door", "stairs"
    ]
    if any(term in legenda_blip for term in domestic_terms):
        print("[BLIP] Contexto doméstico identificado.")
        return True

    return False

# ----------------------------
# 4. Funções de legenda e tradução
# ----------------------------
def gerar_legenda_blip(caminho_imagem: str, prompt_base: str = "", max_length=300) -> str:
    imagem = Image.open(caminho_imagem).convert("RGB")
    inputs = processor(images=imagem, return_tensors="pt", text=prompt_base)

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

# ✅ NOVA FUNÇÃO DE TRADUÇÃO (SEM BUG)
def traduzir_para_portugues(texto_ingles: str) -> str:
    try:
        traducao = GoogleTranslator(source='en', target='pt').translate(texto_ingles)
        return traducao.capitalize()
    except Exception as e:
        return f"[Erro na tradução: {e}]"

# ----------------------------
# 5. Pipeline completo
# ----------------------------
def gerar_legendas_completas(caminho_imagem: str) -> dict:
    if not is_house(caminho_imagem):
        return {"erro": "Imagem rejeitada: não parece ser uma casa."}

    prompts_base = [
        "This is a beautiful house made of ",
        "A home with ",
        "A charming residence featuring ",
        "A cozy house with ",
    ]

    legendas_en = []
    for prompt in prompts_base:
        legenda = gerar_legenda_blip(caminho_imagem, prompt_base=prompt)
        legendas_en.append(legenda)

    legenda_en = max(legendas_en, key=len)
    legenda_pt = traduzir_para_portugues(legenda_en)

    return {"legenda_en": legenda_en, "legenda_pt": legenda_pt}

# ----------------------------
# 6. Teste local
# ----------------------------
if __name__ == "__main__":
    teste_imagem = "exemplo.jpg"
    resultado = gerar_legendas_completas(teste_imagem)
    print(resultado)