import streamlit as st
import pandas as pd
import re
import requests

def pagina_tabelas(usuarios: pd.DataFrame, posts: pd.DataFrame, api_url: str, token: str):
    st.subheader("📋 Tabelas")

    # ----------------------------
    # 👥 Usuários
    # ----------------------------
    st.markdown("### Usuários")
    if not usuarios.empty:
        st.dataframe(usuarios, use_container_width=True)
    else:
        st.info("Nenhum usuário carregado.")

    st.divider()

    # ----------------------------
    # 🧾 Posts (Feed)
    # ----------------------------
    st.markdown("### Posts (feed)")
    if not posts.empty:
        display_posts = posts.copy()
        if all(c in display_posts.columns for c in ["street", "number", "avenue"]):
            display_posts["endereco_completo"] = (
                display_posts["street"].astype(str)
                + ", "
                + display_posts["number"].astype(str)
                + " - "
                + display_posts["avenue"].astype(str)
            )
        st.dataframe(display_posts, use_container_width=True)
    else:
        st.info("Nenhum post carregado.")

    st.divider()

    # ----------------------------
    # 🔥 Top Posts - Mais Visualizados
    # ----------------------------
    st.divider()
    st.markdown("### 👀 Top Posts — Mais Visualizados")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        r = requests.get(f"{api_url}/posts/topPosts/views", headers=headers, timeout=8)
        if r.status_code == 200:
            data = r.json().get("data", [])

            pattern = r"Post:\s*(\d+)\s*\|\s*Views:\s*(\d+)\s*\|\s*Author:\s*(\d+)"
            parsed = [re.match(pattern, item) for item in data]
            parsed = [p.groups() for p in parsed if p]

            if parsed:
                df_top_views = pd.DataFrame(parsed, columns=["post_id", "views", "author"])
                df_top_views = df_top_views.astype({"post_id": int, "views": int, "author": int})
                df_top_views = df_top_views.sort_values("views", ascending=False)

                st.dataframe(df_top_views, use_container_width=True)
            else:
                st.info("Nenhum Top Views encontrado.")
        else:
            st.warning("⚠️ Não foi possível carregar os Top Views.")
    except Exception as e:
        st.error(f"Erro ao buscar Top Views: {e}")


    # ----------------------------
    # ❤️ Top Likes
    # ----------------------------
    st.markdown("### ❤️ Top Likes")

    try:
        r = requests.get(f"{api_url}/posts/topPosts/likes", headers=headers, timeout=8)
        if r.status_code == 200:
            data = r.json().get("data", [])

            pattern_likes = r"Post(\d+)\s*\|\s*Liked Times:\s*(\d+)\s*\|\s*Author:\s*(\d+)"

            parsed = []
            for item in data:
                m = re.match(pattern_likes, item)
                if m:
                    parsed.append(m.groups())

            if parsed:
                df_likes = pd.DataFrame(parsed, columns=["post_id", "likes", "author"])
                df_likes["post_id"] = df_likes["post_id"].astype(int)
                df_likes["likes"] = df_likes["likes"].astype(int)
                df_likes["author"] = df_likes["author"].astype(int)

                df_likes = df_likes.sort_values(by="likes", ascending=False)

                st.dataframe(df_likes, use_container_width=True)
            else:
                st.info("Nenhum Top Likes encontrado (regex não casou).")
        else:
            st.warning("⚠️ Não foi possível carregar os Top Likes.")

    except Exception as e:
        st.error(f"Erro ao buscar top likes: {e}")

