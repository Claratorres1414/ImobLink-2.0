from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

client = TestClient(app)


@patch("main.os.path.exists")
def test_prever_sem_modelo(mock_exists):
    mock_exists.return_value = False  # simula que o modelo NÃO existe

    payload = {
        "id": 1,
        "price": 100000,
        "description": "Casa teste",
        "street": "Rua A",
        "avenue": "Av B",
        "type": "casa"
    }

    response = client.post("/prever-popularidade", json=payload)

    assert response.status_code == 200  # sua API retorna 200 mesmo com erro
    data = response.json()

    assert "erro" in data
    assert data["erro"] == "Modelo ainda não foi treinado"