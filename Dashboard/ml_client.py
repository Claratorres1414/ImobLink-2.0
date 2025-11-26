import requests

FASTAPI_URL = "http://127.0.0.1:8000"

def treinar_popularidade(posts):
    return requests.post(f"{FASTAPI_URL}/treinar-popularidade", json=posts).json()

def prever_pop(post):
    return requests.post(f"{FASTAPI_URL}/prever-popularidade", json=post).json()

def prever_feed_completo(posts):
    return requests.post(f"{FASTAPI_URL}/prever-feed", json=posts).json()
