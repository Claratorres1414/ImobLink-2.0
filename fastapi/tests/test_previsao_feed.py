from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

client = TestClient(app)


@patch("main.prever_feed")
def test_prever_feed_sucesso(mock_feed):
    mock_feed.return_value = [
        {"predicted_popularity": 123.4, "postId": 1},
        {"predicted_popularity": 456.7, "postId": 2}
    ]

    payload = [
        {
            "id": 1,
            "price": 100000,
            "description": "Casa A",
            "street": "Rua A",
            "avenue": "Av A",
            "type": "casa"
        },
        {
            "id": 2,
            "price": 200000,
            "description": "Casa B",
            "street": "Rua B",
            "avenue": "Av B",
            "type": "apartamento"
        }
    ]

    response = client.post("/prever-feed", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 2
    assert "predicted_popularity" in data[0]

@patch("main.prever_feed")
def test_prever_feed_sem_modelo(mock_feed):
    mock_feed.return_value = [
        {"erro": "Modelo ainda não foi treinado"},
        {"erro": "Modelo ainda não foi treinado"}
    ]

    payload = [
        {"id": 1, "price": 1, "description": "", "street": "", "avenue": "", "type": ""},
        {"id": 2, "price": 1, "description": "", "street": "", "avenue": "", "type": ""}
    ]

    response = client.post("/prever-feed", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert "erro" in data[0]

@patch("main.prever_feed")
def test_prever_feed_erro(mock_feed):
    mock_feed.side_effect = Exception("Erro geral")

    payload = [
        {
            "id": 1,
            "price": 100000,
            "description": "Casa",
            "street": "Rua",
            "avenue": "Av",
            "type": "casa"
        }
    ]

    response = client.post("/prever-feed", json=payload)

    assert response.status_code == 500
    assert "erro" in response.json()