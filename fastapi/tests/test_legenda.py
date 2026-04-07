from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch
import io

client = TestClient(app)

def test_debug():
    assert True


# ✅ SUCESSO
@patch("main.gerar_legendas_completas")
def test_gerar_legenda_sucesso(mock_legenda):
    mock_legenda.return_value = {
        "legenda_en": "a beautiful house",
        "legenda_pt": "uma casa bonita"
    }

    fake_image = io.BytesIO(b"fake image content")

    response = client.post(
        "/gerar-legenda",
        files={"file": ("teste.jpg", fake_image, "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()

    assert data["legenda_en"] == "a beautiful house"
    assert data["legenda_pt"] == "uma casa bonita"


# ❌ SEM ARQUIVO
def test_gerar_legenda_sem_arquivo():
    response = client.post("/gerar-legenda")
    assert response.status_code == 422


# 💥 ERRO INTERNO
@patch("main.gerar_legendas_completas")
def test_gerar_legenda_erro(mock_legenda):
    mock_legenda.side_effect = Exception("Erro interno")

    fake_image = io.BytesIO(b"fake image content")

    response = client.post(
        "/gerar-legenda",
        files={"file": ("teste.jpg", fake_image, "image/jpeg")}
    )

    assert response.status_code == 500
    assert "erro" in response.json()