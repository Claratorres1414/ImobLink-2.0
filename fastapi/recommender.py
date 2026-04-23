from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def build_text(post):
    return " ".join([
        str(post.get("description", "")),
        str(post.get("type", "")),
        str(post.get("avenue", "")),
        str(post.get("street", "")),
        str(post.get("price", "")),
        str(post.get("likedTimes", "")),
        str(post.get("views", ""))
    ])


def recommend(data):
    posts = data.get("posts", [])

    if not posts:
        return []

    texts = [build_text(p) for p in posts]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts)

    scores = []

    for i, post in enumerate(posts):
        score = (
            float(post.get("views", 0)) * 0.6 +
            float(post.get("likedTimes", 0)) * 1.5
        )
        scores.append({
            "id": post["id"],
            "score": score
        })

    return sorted(scores, key=lambda x: x["score"], reverse=True)[:10]