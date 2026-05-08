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
    for item in resultados:
        texto = item[1].strip()

        texto_lower = texto.lower()

        # procura qualquer variação tipo FILACAO, FILIACAO, FILIAÇÃO etc
        if "fila" in texto_lower or "fili" in texto_lower:
            
            partes = re.split(r'fil[a-zçãáõôêéíóú]*', texto, flags=re.IGNORECASE)

            if partes:
                nome = partes[0].strip()

                # remove "nome" caso venha junto
                nome = re.sub(r'^nome\s*', '', nome, flags=re.IGNORECASE)

                # remove espaços duplicados
                nome = re.sub(r'\s+', ' ', nome).strip()

                if len(nome.split()) >= 3:
                    return nome

    return "Nome não identificado"
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
