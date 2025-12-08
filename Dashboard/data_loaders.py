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

    # ===============================
    # 🔵 BUSCAR COMENTÁRIOS POR POST
    # ===============================
    comentarios_list = []

    for _, p in posts.iterrows():
        post_id = p["id"]

        url = f"{api_url}/comments/getComments/post/{post_id}"
        try:
            res = requests.get(url, headers=headers)
            if not res.ok:
                continue

            lista = res.json()     # array de comentários

            for c in lista:

                # Buscar dados do autor (igual ao front faz)
                autor_url = f"{api_url}/user/getAccount/{c['authorId']}"
                try:
                    autor_res = requests.get(autor_url, headers=headers)
                    if autor_res.ok:
                        autor = autor_res.json()
                    else:
                        autor = {"name": "Usuário", "imageProfileId": None}
                except:
                    autor = {"name": "Usuário", "imageProfileId": None}

                comentarios_list.append({
                    **c,
                    "autorNome": autor.get("name"),
                    "autorImagem": autor.get("imageProfileId"),
                    "postId": post_id,
                })

        except Exception as e:
            print("Erro ao carregar comentários:", e)

    comentarios = pd.DataFrame(comentarios_list)

    return usuarios, posts, followers, followings, favs, comentarios