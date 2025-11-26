import streamlit as st
import pandas as pd

def pagina_comentarios(comentarios_df, usuarios_df, posts_df):

    st.header("💬 Comentários da ImobLink")

    if comentarios_df.empty:
        st.warning("Nenhum comentário encontrado.")
        return

    # Renomear colunas padronizadas
    comentarios_df = comentarios_df.rename(columns={
        "userId": "UserId",
        "userName": "Nome",
        "userPhoto": "Foto",
        "comment": "Comentário",
        "createdAt": "Data",
        "postId": "PostId"
    })

    # Trazer descrição do post
    if "PostId" in comentarios_df.columns:
        comentarios_df["Post"] = comentarios_df["PostId"].map(
            posts_df.set_index("id")["descricao"]
        )

    # Ordenar por data decrescente
    try:
        comentarios_df["Data"] = pd.to_datetime(comentarios_df["Data"])
        comentarios_df = comentarios_df.sort_values("Data", ascending=False)
    except:
        pass

    st.subheader("📋 Todos os Comentários")
    st.dataframe(comentarios_df, use_container_width=True)

    st.subheader("📊 Total de Comentários")
    st.metric("Quantidade total", len(comentarios_df))

    # ================================
    # 🔵 Exibição estilo cards
    # ================================
    st.subheader("🗂 Exibição Visual")

    for _, row in comentarios_df.iterrows():
        with st.container(border=True):
            col1, col2 = st.columns([1, 9])

            # Foto
            if pd.notna(row.get("Foto", None)):
                col1.image(row["Foto"], width=60)
            else:
                col1.write("👤")

            # Texto
            col2.markdown(f"**{row['Nome']}** — *{row['Data']}*")
            col2.markdown(f"💬 {row['Comentário']}")

            if "Post" in row and pd.notna(row["Post"]):
                col2.caption(f"📌 Post: {row['Post']}")

    # ================================
    # 🔍 Filtros
    # ================================
    st.subheader("🔎 Filtrar por Usuário")

    nomes = comentarios_df["Nome"].dropna().unique()
    usuario_sel = st.selectbox("Selecione:", ["Todos"] + list(nomes))

    if usuario_sel != "Todos":
        filtrado = comentarios_df[comentarios_df["Nome"] == usuario_sel]
        st.dataframe(filtrado, use_container_width=True)
