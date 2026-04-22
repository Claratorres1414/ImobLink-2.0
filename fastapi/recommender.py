from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def build_text(post):
    description = str(post.get("description", ""))
    type_ = str(post.get("type", ""))
    avenue = str(post.get("avenue", ""))
    street = str(post.get("street", ""))
    price = str(post.get("price", ""))

    return f"{description} {type_} {avenue} {street} {price}"

def recommend(data):
    posts = data["posts"]
    user_posts_ids = data["user_interactions"]

    texts = [build_text(p) for p in posts]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts)

    user_indices = [i for i, p in enumerate(posts) if p["id"] in user_posts_ids]

    if not user_indices:
        return []

    user_profile = tfidf_matrix[user_indices].mean(axis=0).A

    similarities = cosine_similarity(user_profile, tfidf_matrix).flatten()

    results = []
    for i, post in enumerate(posts):
        if post["id"] not in user_posts_ids:
            results.append({
                "id": post["id"],
                "score": float(similarities[i])
            })

    return sorted(results, key=lambda x: x["score"], reverse=True)[:10]