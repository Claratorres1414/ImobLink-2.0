import streamlit as st

def pagina_comentarios(comentarios_df, usuarios_df, posts_df):

    st.header("💬 Comentários da ImobLink")

    if comentarios_df.empty:
        st.warning("Nenhum comentário encontrado.")
        return

    # Juntando informações de usuários e posts
    comentarios_df = comentarios_df.copy()

    # Nome do usuário
    comentarios_df["usuario"] = comentarios_df["idUsuario"].map(
        usuarios_df.set_index("id")["nome"]
    )

    # Texto do post
    comentarios_df["post"] = comentarios_df["idPostagem"].map(
        posts_df.set_index("id")["descricao"]
    )

    st.subheader("Tabela Completa de Comentários")
    st.dataframe(comentarios_df, use_container_width=True)

    st.subheader("📊 Total de Comentários")
    st.metric("Quantidade total", len(comentarios_df))

    # Filtro por usuário
    st.subheader("🔎 Filtrar por Usuário")
    nomes_usuarios = comentarios_df["usuario"].dropna().unique()

    usuario = st.selectbox("Selecione um usuário:", ["Todos"] + list(nomes_usuarios))

    if usuario != "Todos":
        filtrado = comentarios_df[comentarios_df["usuario"] == usuario]
        st.dataframe(filtrado, use_container_width=True)
    else:
        st.dataframe(comentarios_df, use_container_width=True)
