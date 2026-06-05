import os
os.environ["HF_HOME"] = "/root/.cache/huggingface"
os.environ["TORCH_HOME"] = "/root/.cache/torch"

import easyocr
import torchvision.models as models
from transformers import BlipProcessor, BlipForConditionalGeneration

print("📥 Iniciando o pré-download dos modelos de IA...")
easyocr.Reader(['pt', 'en'])
models.resnet50(pretrained=True)
BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
print("✅ Todos os modelos foram baixados com sucesso!")
