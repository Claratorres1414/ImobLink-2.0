import pandas as pd
import requests
import streamlit as st


def get_df(api_url, endpoint, headers):
    try:
        r = requests.get(f"{api_url}{endpoint}", headers=headers, timeout=8)
        if r.status_code == 200:
            return pd.DataFrame(r.json())
    except Exception:
        pass
    return pd.DataFrame()


@st.cache_data(ttl=30)
def carregar_todos_dados(api_url, token):
    headers = {"Authorization": f"Bearer {token}"}

    usuarios = get_df(api_url, "/user/getAll", headers)
    posts = get_df(api_url, "/feed", headers)
    followers = get_df(api_url, "/follow/getFollowers", headers)
    followings = get_df(api_url, "/follow/getFollowings", headers)
    favs = get_df(api_url, "/posts/my-favs", headers)
    comentarios = get_df(api_url, "/comments/getAll", headers)

    return usuarios, posts, followers, followings, favs, comentarios
