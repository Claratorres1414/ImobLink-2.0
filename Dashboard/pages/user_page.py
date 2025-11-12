import streamlit as st
import pandas as pd
import requests

def pagina_usuario(api_url: str, usuarios: pd.DataFrame, posts: pd.DataFrame, token: str):
    st.subheader("👤 Painel do Usuário (Admin View)")
    if usuarios.empty:
        st.warning("Não há usuários para selecionar.")
        st.stop()

    headers = {"Authorization": f"Bearer {token}"}

    # Seleção do usuário
    if {"id", "email"}.issubset(usuarios.columns):
        usuarios["label"] = usuarios.apply(lambda u: f"{u['email']}  (ID: {u['id']})", axis=1)
        user_label = st.selectbox("Selecione usuário:", usuarios["label"].tolist())
        user_row = usuarios[usuarios["label"] == user_label]

    else:
        options = usuarios["id"].astype(str).tolist()
        choice = st.selectbox("Selecione usuário (por id):", options)
        user_row = usuarios[usuarios["id"].astype(str) == choice]

    if user_row.empty:
        st.info("Usuário não encontrado.")
        st.stop()

    user = user_row.iloc[0].to_dict()
    user_id = int(user.get("id")) if "id" in user else None
    st.markdown(
    f"### {user.get('name') or user.get('email')} "
    f"<span style='color:gray; font-size:0.9em'>(ID: {user.get('id')})</span>",
    unsafe_allow_html=True
)



    # ==========================
    # POSTS DO USUÁRIO
    # ==========================
    posts_user = posts[posts["userId"] == user_id] if "userId" in posts.columns else pd.DataFrame()
    st.divider()
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Posts", len(posts_user))

    # ==========================
    # FAVORITOS
    # ==========================
    try:
        r = requests.get(f"{api_url}/admin/info/posts/favedPosts/{user_id}", headers=headers, timeout=8)
        favs_df = pd.DataFrame(r.json()) if r.status_code == 200 else pd.DataFrame()
    except Exception as e:
        st.error(f"Erro ao carregar favoritos: {e}")
        favs_df = pd.DataFrame()

    col2.metric("Favoritos", len(favs_df))

    # ==========================
    # SEGUIDORES / SEGUINDO
    # ==========================
    try:
        followers = requests.get(f"{api_url}/follow/getFollowers/{user_id}", headers=headers, timeout=8)
        followings = requests.get(f"{api_url}/follow/getFollowings/{user_id}", headers=headers, timeout=8)
        followers_df = pd.DataFrame(followers.json()) if followers.status_code == 200 else pd.DataFrame()
        followings_df = pd.DataFrame(followings.json()) if followings.status_code == 200 else pd.DataFrame()
    except Exception:
        followers_df = pd.DataFrame()
        followings_df = pd.DataFrame()

    col3.metric("Seguidores", len(followers_df))
    col4.metric("Seguindo", len(followings_df))

    # ==========================
    # TABELAS DE SEGUIDORES / SEGUINDO
    # ==========================
    st.divider()
    st.subheader("👥 Conexões do Usuário")

    colA, colB = st.columns(2)

    with colA:
        st.markdown("**Seguidores:**")
        if not followers_df.empty:
            st.dataframe(
                followers_df[["id", "name", "email", "role"]],
                hide_index=True,
                use_container_width=True
            )
        else:
            st.info("Nenhum seguidor encontrado.")

    with colB:
        st.markdown("**Seguindo:**")
        if not followings_df.empty:
            st.dataframe(
                followings_df[["id", "name", "email", "role"]],
                hide_index=True,
                use_container_width=True
            )
        else:
            st.info("Não está seguindo ninguém.")

    # ==========================
    # POSTS DETALHADOS
    # ==========================
    st.divider()
    st.subheader("📄 Últimos posts")
    if not posts_user.empty:
        st.dataframe(posts_user, use_container_width=True)
    else:
        st.info("Nenhum post encontrado.")
    # ==========================
    # POSTS FAVORITADOS
    # ==========================
    st.divider()
    st.subheader("⭐ Posts Favoritados")

    if not favs_df.empty:
        cols = [c for c in ["id", "title", "price", "location", "userId"] if c in favs_df.columns]
        st.dataframe(favs_df[cols] if cols else favs_df, use_container_width=True)
    else:
        st.info("Nenhum post favoritado por este usuário.")

