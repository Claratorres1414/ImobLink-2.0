from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch
import io

client = TestClient(app)

@patch("main.processar_documento")
def test_processar_documento_sucesso(mock_processar):
    mock_processar.return_value = {
        "nome": "João",
        "cpf": "12345678900"
    }

    fake_frente = io.BytesIO(b"fake frente")
    fake_verso = io.BytesIO(b"fake verso")

    response = client.post(
        "/processar-documento",
        files={
            "frente": ("frente.jpg", fake_frente, "image/jpeg"),
            "verso": ("verso.jpg", fake_verso, "image/jpeg")
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert "nome" in data
    assert "cpf" in data