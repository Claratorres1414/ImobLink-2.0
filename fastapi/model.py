import pandas as pd
import joblib
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
import os

MODELO_CAMINHO = "modelo_popularidade_pre.pkl"

# ----------------------------
# FUNÇÃO PARA PREPARAR FEATURES PRÉ-PUBLICAÇÃO
# ----------------------------
def preparar_features_pre_publicacao(posts):
    df = pd.DataFrame(posts)

    # Garantir colunas básicas
    df["descLen"] = df["description"].apply(lambda x: len(x) if isinstance(x, str) else 0)

    # Codificação de tipo, rua, avenida será feita pelo OneHotEncoder na pipeline

    return df

# ----------------------------
# TREINAR MODELO DE REGRESSÃO (PRÉ-PUBLICAÇÃO)
# ----------------------------
def treinar_modelo(posts: list):
    """
    Treina modelo usando apenas features disponíveis antes da publicação.
    """
    df = preparar_features_pre_publicacao(posts)

    # Feature alvo: popularidade histórica (você pode criar com base em posts antigos)
    # Exemplo: views + likedTimes + favedTimes + reachedTimes + commentsCount
    df["target_popularity"] = (
        df.get("views", 0) +
        df.get("likedTimes", 0) * 3 +
        df.get("favedTimes", 0) * 2 +
        df.get("reachedTimes", 0) * 1 +
        df.get("comments", 0).apply(lambda x: len(x) if isinstance(x, list) else 0) * 4
    )

    features = ["price", "descLen", "street", "avenue", "type"]

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
        ("regressor", GradientBoostingRegressor())
    ])

    model.fit(X, y)
    joblib.dump(model, MODELO_CAMINHO)

    return {"status": "modelo treinado com sucesso"}

# ----------------------------
# PREVER POST NOVO
# ----------------------------
def prever_post(post: dict):
    if not os.path.exists(MODELO_CAMINHO):
        return {"erro": "Modelo ainda não foi treinado"}

    model = joblib.load(MODELO_CAMINHO)

    # Criar df de 1 linha com features pré-publicação
    df = preparar_features_pre_publicacao([post])
    features = ["price", "descLen", "street", "avenue", "type"]
    X = df[features]

    pred = model.predict(X)[0]

    return {
        "predicted_popularity": float(pred),
        "postId": post.get("id")
    }

# ----------------------------
# PREVER FEED COMPLETO
# ----------------------------
def prever_feed(posts: list):
    return [prever_post(p) for p in posts]
