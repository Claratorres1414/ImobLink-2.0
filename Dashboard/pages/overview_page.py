import streamlit as st
import plotly.express as px
import pandas as pd

def pagina_visao_geral(usuarios: pd.DataFrame, posts: pd.DataFrame):
    st.subheader(f"📈 Visão Geral — Bem-vindo, {st.session_state.user.get('name')}")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Usuários cadastrados", len(usuarios))
    col2.metric("Total de posts", len(posts))

    if "price" in posts.columns and not posts["price"].empty:
        col3.metric("Preço médio (R$)", f"{posts['price'].mean():,.2f}")
    else:
        col3.metric("Preço médio (R$)", "N/A")

    if "role" in usuarios.columns:
        col4.metric("Admins/SuperAdmins", len(usuarios[usuarios["role"].isin(["ADMIN", "SUPER_ADMIN"])]))
    else:
        col4.metric("Admins/SuperAdmins", "N/A")

    st.divider()
    two_col_1, two_col_2 = st.columns(2)

    # Distribuição de preços
    if {"price", "createdBy"}.issubset(posts.columns):
        fig_price = px.histogram(
            posts, x="price", color="createdBy", nbins=12,
            title="Distribuição de preços (por usuário)",
            hover_data=["createdBy", "street", "avenue", "number", "description"]
        )
        two_col_1.plotly_chart(fig_price, use_container_width=True)
    elif "price" in posts.columns:
        two_col_1.plotly_chart(px.histogram(posts, x="price", nbins=12, title="Distribuição de preços"), use_container_width=True)
    else:
        two_col_1.info("Sem dados de preço para mostrar.")

    # Posts por usuário
    if "createdBy" in posts.columns:
        df_posts_user = posts.groupby("createdBy")["id"].count().reset_index().rename(columns={"id": "qtd"})
        fig_posts_user = px.bar(df_posts_user, x="createdBy", y="qtd", color="createdBy", title="Posts por usuário")
        two_col_2.plotly_chart(fig_posts_user, use_container_width=True)
    else:
        two_col_2.info("Sem dados de autor (createdBy).")

    # Resumo por rua
    if "street" in posts.columns:
        st.divider()
        df_rua = posts.groupby("street")["id"].count().reset_index().rename(columns={"id": "qtd_posts"})
        fig_pie_rua = px.pie(df_rua, names="street", values="qtd_posts", title="Posts por rua", hover_data=["qtd_posts"])
        fig_pie_rua.update_traces(textinfo="percent+label")
        st.plotly_chart(fig_pie_rua, use_container_width=True)
