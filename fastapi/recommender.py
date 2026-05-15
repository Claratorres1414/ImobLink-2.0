from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def build_post_text(post):
    return " ".join([
        str(post.get("description", "")),
        str(post.get("type", "")),
        str(post.get("street", "")),
        str(post.get("avenue", "")),
        str(post.get("price", "")),
    ])

def get_profile_score(user_profile, post):
    score = 0.0

    objective = user_profile.get("objective")
    property_type = user_profile.get("propertyType")
    price_range = user_profile.get("priceRange")

    # 1. tipo do imóvel (MUITO importante)
    if property_type and post.get("type") == property_type:
        score += 3.0

    # 2. objetivo (aluguel/venda)
    if objective and post.get("type") == objective:
        score += 2.0

    # 3. preço (já existe lógica boa)
    price_match = get_price_score(
        post.get("price", 0),
        price_range,
        objective
    )
    score += price_match * 4.0  # 🔥 peso alto

    return score
def build_user_profile(user_profile):
    return " ".join([
        str(user_profile.get("objective", "")),
        str(user_profile.get("propertyType", "")),
        str(user_profile.get("priceRange", "")),
    ])


def get_price_score(price, price_range, objective):
    price = float(price)

    if objective == "aluguel":
        ranges = {
            "baixo": (0, 1500),
            "medio": (1501, 3500),
            "alto": (3501, 999999999)
        }
    else:  # venda
        ranges = {
            "baixo": (0, 200000),
            "medio": (200001, 500000),
            "alto": (500001, 999999999)
        }

    min_price, max_price = ranges.get(
        price_range,
        (0, 999999999)
    )

    return 1.0 if min_price <= price <= max_price else 0.0


def recommend(data):
    posts = data.get("posts", [])
    user_profile = data.get("user_profile", {}) or {}
    user_interactions = set(data.get("user_interactions", []))
    profile_score = get_profile_score(user_profile, post)

    
    profile_weight = 1.0 if user_profile.get("objective") else 0.3
    final_score *= profile_weight

    if not posts:
        return []

    user_text = build_user_profile(user_profile)
    post_texts = [build_post_text(post) for post in posts]

    corpus = [user_text] + post_texts

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    user_vector = tfidf_matrix[0]
    posts_vectors = tfidf_matrix[1:]

    similarities = cosine_similarity(user_vector, posts_vectors)[0]

    recommendations = []

    for i, post in enumerate(posts):
        similarity_score = similarities[i]

        interaction_boost = 1.5 if post["id"] in user_interactions else 0

        price_boost = get_price_score(
            post.get("price", 0),
            user_profile.get("priceRange"),
            user_profile.get("objective")
        )

        popularity_score = (
            float(post.get("views", 0)) * 0.3 +
            float(post.get("likedTimes", 0)) * 0.7
        )

        final_score = (
            profile_score * 4 +
            similarity_score * 3 +
            interaction_boost +
            price_boost +
            popularity_score
        )

        recommendations.append({
            "id": int(post["id"]),
            "score": float(final_score)
        })

    recommendations.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return recommendations[:10]