import cv2
import easyocr
import re

def redimensionar_imagem(caminho, largura_alvo=1000):
    imagem = cv2.imread(caminho)
    if imagem is None:
        return None

    altura, largura = imagem.shape[:2]
    proporcao = largura_alvo / float(largura)
    nova_altura = int(altura * proporcao)
    
    return cv2.resize(imagem, (largura_alvo, nova_altura))

def extrair_nome(resultados):
    texto_tudo = " ".join([r[1] for r in resultados])
    match = re.search(r'nome\s*[:\-]?\s*([A-ZÀ-Úa-zà-ú\s]{5,}?)(?=\s+(fili|data|natu|org|sexo|nome da mãe|observa|$))', texto_tudo, re.IGNORECASE)
    
    if match:
        nome = match.group(1).strip()
        if len(nome.split()) >= 2:
            return nome

    candidatos = [
        caixa[1] for caixa in resultados
        if len(caixa[1].split()) >= 3 and not any(char.isdigit() for char in caixa[1])
    ]
    return max(candidatos, key=len) if candidatos else "Nome não identificado"

def extrair_data_nascimento(texto):
    match = re.search(r'(\d{2}[\/\-]\d{2}[\/\-]\d{4})', texto)
    return match.group(0) if match else "Data não identificada"

def extrair_cpf(texto):
    match = re.search(r'\d{3}[.\-]?\d{3}[.\-]?\d{3}[.\-]?\d{2}', texto)
    return match.group(0) if match else "CPF não identificado"

def processar_documento(frente_path, verso_path):
    reader = easyocr.Reader(['pt', 'en'])

    frente_img = redimensionar_imagem(frente_path)
    verso_img = redimensionar_imagem(verso_path)

    if frente_img is None or verso_img is None:
        raise Exception("Erro ao carregar ou redimensionar imagens.")

    frente_resultados = reader.readtext(frente_img, paragraph=True)
    verso_resultados = reader.readtext(verso_img, paragraph=True)

    texto_total = " ".join([r[1] for r in frente_resultados + verso_resultados])

    return {
        "nome": extrair_nome(frente_resultados),
        "data_nascimento": extrair_data_nascimento(texto_total),
        "cpf": extrair_cpf(texto_total)
    }
