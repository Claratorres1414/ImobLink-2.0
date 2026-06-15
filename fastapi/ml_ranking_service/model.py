import os
import pandas as pd
import joblib
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Caminhos dos dois modelos distintos
CAMINHO_MODELO_POPULARIDADE = "modelo_popularidade_pre.pkl"
CAMINHO_MODELO_RECOMENDACAO = "modelo_recomendacao_ia.pkl"

# =====================================================================
# 🧠 MODELO 1: PREVISÃO DE POPULARIDADE (PRÉ-PUBLICAÇÃO)
# =====================================================================

def preparar_features_pre_publicacao(posts):
    df = pd.DataFrame(posts)
    df["descLen"] = df["description"].apply(lambda x: len(x) if isinstance(x, str) else 0)
    return df

def treinar_modelo_popularidade(posts: list):
    df = preparar_features_pre_publicacao(posts)

    # Garante que as colunas numéricas existam no DataFrame, mesmo que não venham no JSON
    for col in ["views", "likedTimes", "favedTimes", "reachedTimes"]:
        if col not in df.columns:
            df[col] = 0

    # Calcula o peso dos comentários de forma segura se a coluna existir
    if "comments" in df.columns:
        comments_score = df["comments"].apply(lambda x: len(x) if isinstance(x, list) else 0) * 4
    else:
        comments_score = 0

    # Agora o cálculo está 100% protegido contra colunas ausentes
    df["target_popularity"] = (
        df["views"].astype(float) +
        df["likedTimes"].astype(float) * 3 +
        df["favedTimes"].astype(float) * 2 +
        df["reachedTimes"].astype(float) * 1 +
        comments_score
    )

    features = ["price", "descLen", "street", "avenue", "type"]
    
    # Garante que nenhuma feature essencial esteja faltando por segurança
    for col in features:
        if col not in df.columns:
            df[col] = 0 if col in ["price", "descLen"] else ""

    X = df[features]
    y = df["target_popularity"]

    categoricas = ["street", "avenue", "type"]
    numericas = [f for f in features if f not in categoricas]

    preprocess = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categoricas),
            ("num", "passthrough", numericas)
        ]
    )

    model = Pipeline([
        ("preprocess", preprocess),
        ("regressor", GradientBoostingRegressor(random_state=42))
    ])

    model.fit(X, y)
    joblib.dump(model, CAMINHO_MODELO_POPULARIDADE)
    return {"status": "Modelo de popularidade treinado com sucesso"}

def prever_post(post: dict):
    if not os.path.exists(CAMINHO_MODELO_POPULARIDADE):
        return {"erro": "Modelo de popularidade ainda não foi treinado"}

    model = joblib.load(CAMINHO_MODELO_POPULARIDADE)
    df = preparar_features_pre_publicacao([post])
    features = ["price", "descLen", "street", "avenue", "type"]
    X = df[features]
    
    pred = model.predict(X)[0]
    return {
        "predicted_popularity": float(pred),
        "postId": post.get("id")
    }

def prever_feed(posts: list):
    return [prever_post(p) for p in posts]


# =====================================================================
# 🧠 MODELO 2: SISTEMA DE RECOMENDAÇÃO PERSONALIZADO
# =====================================================================

def calcular_match_preco(price, price_range, objective):
    try:
        price = float(price)
    except (ValueError, TypeError):
        price = 0.0

    ranges = {
        "aluguel": {"baixo": (0, 1500), "medio": (1501, 3500), "alto": (3501, 999999999)},
        "venda": {"baixo": (0, 200000), "medio": (200001, 500000), "alto": (500001, 999999999)}
    }
    
    obj_dict = ranges.get(str(objective).lower(), ranges["venda"])
    min_p, max_p = obj_dict.get(str(price_range).lower(), (0, 999999999))
    return 1.0 if min_p <= price <= max_p else 0.0

def extrair_features_linha(user_profile, post, similarity_score):
    return {
        "similarity_score": float(similarity_score),
        "match_tipo": 1.0 if user_profile.get("objective") == post.get("type") else 0.0,
        "match_propriedade": 1.0 if user_profile.get("propertyType") == post.get("propertyType") else 0.0,
        "match_preco": calcular_match_preco(post.get("price", 0), user_profile.get("priceRange"), user_profile.get("objective")),
        "item_price": float(post.get("price", 0) or 0),
        "item_views": float(post.get("views", 0) or 0),
        "item_likes": float(post.get("likedTimes", 0) or 0)
    }

def treinar_modelo_recomendacao(dados_historicos: list):
    if not dados_historicos:
        return {"erro": "Nenhum dado enviado para treino"}

    linhas_features = []
    targets = []

    for item in dados_historicos:
        user = item.get("user_profile", {})
        post = item.get("post", {})
        
        user_text = f"{user.get('objective', '')} {user.get('propertyType', '')} {user.get('priceRange', '')}"
        post_text = f"{post.get('description', '')} {post.get('type', '')} {post.get('street', '')} {post.get('price', '')}"
        
        vectorizer = TfidfVectorizer()
        try:
            tfidf = vectorizer.fit_transform([user_text, post_text])
            sim = cosine_similarity(tfidf[0], tfidf[1])[0][0]
        except:
            sim = 0.0

        features = extrair_features_linha(user, post, sim)
        linhas_features.append(features)

        score_sucesso = float(post.get("views", 0)) * 0.2 + float(post.get("likedTimes", 0)) * 1.0
        targets.append(score_sucesso)

    X = pd.DataFrame(linhas_features)
    y = pd.Series(targets)

    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, CAMINHO_MODELO_RECOMENDACAO)
    
    return {"status": "Modelo de Recomendação treinado com sucesso!", "linhas_processadas": len(X)}