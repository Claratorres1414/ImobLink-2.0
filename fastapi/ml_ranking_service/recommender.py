import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from model import CAMINHO_MODELO_RECOMENDACAO, extrair_features_linha

def recommend_with_ml(data):
    posts = data.get("posts", [])
    user_profile = data.get("user_profile", {}) or {}
    user_interactions = set(data.get("user_interactions", []))

    if not posts:
        return []

    user_text = " ".join([str(user_profile.get("objective", "")), str(user_profile.get("propertyType", "")), str(user_profile.get("priceRange", ""))])
    post_texts = [" ".join([str(p.get("description", "")), str(p.get("type", "")), str(p.get("street", "")), str(p.get("price", ""))]) for p in posts]
    
    corpus = [user_text] + post_texts
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    user_vector = tfidf_matrix[0]
    posts_vectors = tfidf_matrix[1:]
    similarities = cosine_similarity(user_vector, posts_vectors)[0]

    modelo_treinado = None
    if os.path.exists(CAMINHO_MODELO_RECOMENDACAO):
        modelo_treinado = joblib.load(CAMINHO_MODELO_RECOMENDACAO)

    recommendations = []
    linhas_para_prever = []
    posts_validos = []

    for i, post in enumerate(posts):
        if post["id"] in user_interactions:
            continue

        sim_score = similarities[i]
        linhas_features = extrair_features_linha(user_profile, post, sim_score)
        linhas_para_prever.append(linhas_features)
        posts_validos.append(post)

    if not posts_validos:
        return []

    if modelo_treinado:
        X_pred = pd.DataFrame(linhas_para_prever)
        scores_preditos = modelo_treinado.predict(X_pred)
    else:
        # Fallback caso o modelo de recomendação ainda não tenha sido treinado
        scores_preditos = [
            (lin["similarity_score"] * 3 + lin["match_tipo"] * 2 + lin["match_preco"] * 4 + lin["item_likes"])
            for lin in linhas_para_prever
        ]

    for idx, post in enumerate(posts_validos):
        recommendations.append({
            "id": int(post["id"]),
            "score": float(scores_preditos[idx])
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:10]