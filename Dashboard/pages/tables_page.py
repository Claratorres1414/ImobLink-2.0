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
        st.markdown("**Selecione um usuário na aba '👤 Usuário Específico' para ver detalhes.**")
    else:
        st.info("Nenhum usuário carregado.")

    st.divider()

    # ----------------------------
    # 🧾 Posts (feed)
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

    # ----------------------------
    # 🔥 Top Posts (mais visualizados)
    # ----------------------------
    st.divider()
    st.markdown("### 🔥 Top Posts (mais visualizados)")

    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.get(f"{api_url}/posts/topPosts/views", headers=headers, timeout=8)
        if r.status_code == 200:
            data = r.json()
            pattern = r"Post:\s*(\d+)\s*\|\s*Views:\s*(\d+)\s*\|\s*Author:\s*(\d+)"
            parsed = [re.match(pattern, item) for item in data]
            parsed = [p.groups() for p in parsed if p]

            df_top = pd.DataFrame(parsed, columns=["post_id", "views", "author"])
            df_top["views"] = df_top["views"].astype(int)
            df_top["post_id"] = df_top["post_id"].astype(int)
            df_top["author"] = df_top["author"].astype(int)

            st.dataframe(df_top, use_container_width=True)
        else:
            st.warning("⚠️ Não foi possível carregar os Top Posts.")
    except Exception as e:
        st.error(f"Erro ao buscar top posts: {e}")
