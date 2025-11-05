import streamlit as st
import plotly.express as px
import pandas as pd

def pagina_graficos(posts: pd.DataFrame):
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
