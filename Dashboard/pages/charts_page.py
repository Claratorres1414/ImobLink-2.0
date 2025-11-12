import streamlit as st
import plotly.express as px
import pandas as pd

def pagina_graficos(posts: pd.DataFrame, api_url: str, token: str):
    st.subheader("📊 Gráficos detalhados")

    if all(col in posts.columns for col in ["street", "avenue", "number"]):
        posts["endereco_completo"] = posts["street"].astype(str) + ", " + posts["number"].astype(str) + " - " + posts["avenue"].astype(str)
    else:
        posts["endereco_completo"] = posts.get("street", "")

    col1, col2 = st.columns(2)

    if {"price", "createdBy"}.issubset(posts.columns):
        fig_price = px.histogram(posts, x="price", nbins=12, color="createdBy", hover_data=["createdBy", "endereco_completo", "description"], title="Distribuição de preços por usuário")
        col1.plotly_chart(fig_price, use_container_width=True)
    else:
        col1.info("Sem dados de preço disponíveis.")

    if "createdBy" in posts.columns:
        df_user_counts = posts.groupby("createdBy")["id"].count().reset_index().rename(columns={"id": "qtd_posts"})
        fig_user_counts = px.bar(df_user_counts, x="createdBy", y="qtd_posts", color="createdBy", text="qtd_posts", title="Número de posts por usuário")
        fig_user_counts.update_traces(textposition="outside")
        col2.plotly_chart(fig_user_counts, use_container_width=True)
    else:
        col2.info("Sem dados de autor.")

    if "street" in posts.columns:
        st.divider()
        df_rua = posts.groupby("street")["id"].count().reset_index().rename(columns={"id": "qtd_posts"})
        fig_pie = px.pie(df_rua, names="street", values="qtd_posts", title="Posts por rua", hover_data=["qtd_posts"])
        fig_pie.update_traces(textinfo="percent+label")
        st.plotly_chart(fig_pie, use_container_width=True)

    if {"price", "createdBy"}.issubset(posts.columns):
        st.divider()
        df_user_price = posts.groupby("createdBy")["price"].mean().reset_index().rename(columns={"price": "preco_medio"})
        fig_user_price = px.bar(df_user_price, x="createdBy", y="preco_medio", color="createdBy", text="preco_medio", title="Preço médio por usuário")
        fig_user_price.update_traces(texttemplate="%{text:.2f}", textposition="outside")
        st.plotly_chart(fig_user_price, use_container_width=True)
    # ==========================
    # 🔥 Top Posts (mais visualizados)
    # ==========================
    import re
    import requests

    st.divider()
    st.subheader("🔥 Top Posts (mais visualizados)")

    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.get(f"{api_url}/posts/topPosts", headers=headers, timeout=8)
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

            fig = px.bar(
                df_top,
                x="post_id",
                y="views",
                color="author",
                title="Top Posts por Visualizações",
                labels={"post_id": "ID do Post", "views": "Visualizações", "author": "Autor"},
                text="views"
            )
            fig.update_traces(textposition="outside")
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.warning("Não foi possível carregar os Top Posts.")
    except Exception as e:
        st.error(f"Erro ao buscar top posts: {e}")
