from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch
import io

client = TestClient(app)

def test_debug():
    assert True


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