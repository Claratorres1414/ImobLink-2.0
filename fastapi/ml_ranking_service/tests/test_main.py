import pytest
from fastapi.testclient import TestClient
import os

# Importamos o app direto da sua main
from main import app
from model import CAMINHO_MODELO_POPULARIDADE, CAMINHO_MODELO_RECOMENDACAO

client = TestClient(app)

# ---------------------------------------------------------------------
# 🎭 FIXTURES (Dados fictícios para reaproveitar nos testes)
# ---------------------------------------------------------------------
@pytest.fixture
def mock_posts():
    return [
        {
            "id": 1,
            "description": "Linda casa de praia com piscina e vista pro mar",
            "type": "venda",
            "avenue": "Av. Atlantica",
            "price": 450000.0,
            "street": "Rua das Flores",
            "likedTimes": 15,
            "views": 200
        },
        {
            "id": 2,
            "description": "Apartamento compacto perto do metro e centro",
            "type": "aluguel",
            "avenue": "Av. Paulista",
            "price": 2500.0,
            "street": "Rua Augusta",
            "likedTimes": 5,
            "views": 80
        }
    ]

@pytest.fixture
def mock_user_profile():
    return {
        "objective": "aluguel",
        "propertyType": "Apartamento",
        "priceRange": "medio"
    }


# ---------------------------------------------------------------------
# 🧪 CASOS DE TESTE
# ---------------------------------------------------------------------

def test_registrar_interacao():
    """Garante que o endpoint de salvar curtidas/cliques locais funciona"""
    payload = {"user_id": 999, "post_id": 1}
    response = client.post("/interaction", json=payload)
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_treinar_popularidade(mock_posts):
    """Testa o pipeline de treino do modelo de popularidade pré-publicação"""
    response = client.post("/treinar-popularidade", json=mock_posts)
    
    assert response.status_code == 200
    assert "sucesso" in response.json()["status"]
    assert os.path.exists(CAMINHO_MODELO_POPULARIDADE)


def test_prever_popularidade_unico(mock_posts):
    """Testa a previsão de sucesso de um único imóvel novo"""
    # Garante que o modelo existe antes de prever
    client.post("/treinar-popularidade", json=mock_posts)
    
    post_novo = mock_posts[0]
    response = client.post("/prever-popularidade", json=post_novo)
    
    assert response.status_code == 200
    dados = response.json()
    assert "predicted_popularity" in dados
    assert dados["postId"] == post_novo["id"]


def test_prever_popularidade_feed(mock_posts):
    """Testa a previsão em lote para múltiplos imóveis novos"""
    client.post("/treinar-popularidade", json=mock_posts)
    
    response = client.post("/prever-feed", json=mock_posts)
    
    assert response.status_code == 200
    dados = response.json()
    assert isinstance(dados, list)
    assert len(dados) == len(mock_posts)
    assert "predicted_popularity" in dados[0]


def test_recommend_com_fallback(mock_posts, mock_user_profile):
    """Testa se o recomendador funciona mesmo se o modelo de treino ainda não existir"""
    # Remove o modelo de recomendação se ele existir para forçar o fallback seguro
    if os.path.exists(CAMINHO_MODELO_RECOMENDACAO):
        os.remove(CAMINHO_MODELO_RECOMENDACAO)
        
    payload = {
        "user_id": 999,
        "posts": mock_posts,
        "user_interactions": [1],  # Usuário já interagiu com o ID 1, deve ser filtrado
        "user_profile": mock_user_profile
    }
    
    response = client.post("/recommend", json=payload)
    
    assert response.status_code == 200
    recomendacoes = response.json()
    assert isinstance(recomendacoes, list)
    
    # O post ID 1 deve ter sido excluído porque estava em 'user_interactions'
    for rec in recomendacoes:
        assert rec["id"] != 1


def test_treinar_recomendador_e_inferencia(mock_posts, mock_user_profile):
    """Treina o recomendador com IA e valida se ele ordena o feed por predição"""
    # Monta o histórico que o Java enviaria
    payload_treino = [
        {"user_profile": mock_user_profile, "post": mock_posts[0]},
        {"user_profile": mock_user_profile, "post": mock_posts[1]}
    ]
    
    # 1. Treina o modelo de recomendação por IA
    response_treino = client.post("/treinar-recomendador", json=payload_treino)
    assert response_treino.status_code == 200
    assert os.path.exists(CAMINHO_MODELO_RECOMENDACAO)
    
    # 2. Pede uma recomendação usando o novo cérebro treinado
    payload_rec = {
        "user_id": 999,
        "posts": mock_posts,
        "user_interactions": [],
        "user_profile": mock_user_profile
    }
    response_rec = client.post("/recommend", json=payload_rec)
    
    assert response_rec.status_code == 200
    recomendacoes = response_rec.json()
    assert len(recomendacoes) > 0
    assert "score" in recomendacoes[0]