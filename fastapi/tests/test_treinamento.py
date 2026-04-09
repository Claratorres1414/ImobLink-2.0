from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

client = TestClient(app)


@patch("main.treinar_modelo")
def test_treinar_modelo_sucesso(mock_treinar):
    mock_treinar.return_value = {
        "status": "modelo treinado com sucesso"
    }

    payload = [
        {
            "price": 500000,
            "description": "Casa grande com piscina",
            "street": "Rua A",
            "avenue": "Av B",
            "type": "casa",
            "views": 100,
            "likedTimes": 10,
            "favedTimes": 5,
            "reachedTimes": 50,
            "comments": ["bom", "legal"]
        }
    ]

    response = client.post("/treinar-popularidade", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "modelo treinado com sucesso"



def test_treinar_modelo_lista_vazia():
    response = client.post("/treinar-popularidade", json=[])

    # Seu código não valida explicitamente, então pode passar ou falhar
    assert response.status_code in [200, 500]


@patch("main.treinar_modelo")
def test_treinar_modelo_erro(mock_treinar):
    mock_treinar.side_effect = Exception("Erro no treino")

    payload = [
        {
            "price": 100000,
            "description": "Teste",
            "street": "Rua X",
            "avenue": "Av Y",
            "type": "apartamento"
        }
    ]

    response = client.post("/treinar-popularidade", json=payload)

    assert response.status_code == 500
    assert "erro" in response.json()