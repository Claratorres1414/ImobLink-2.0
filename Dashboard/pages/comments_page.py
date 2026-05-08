import streamlit as st
import pandas as pd

def pagina_comentarios(comentarios_df, usuarios_df, posts_df):

    comentarios_df = comentarios_df.copy()

    st.header("💬 Comentários da ImobLink")

    if comentarios_df.empty:
        st.warning("Nenhum comentário encontrado.")
        return

    # ============================================
    # 1️⃣ TEXTO DO COMENTÁRIO
    # ============================================
    coluna_comentario = None
    for c in ["comment", "comentario", "content", "text", "mensagem"]:
        if c in comentarios_df.columns:
            coluna_comentario = c
            break

    comentarios_df["Comentário"] = (
        comentarios_df[coluna_comentario].fillna("(sem texto)")
        if coluna_comentario
        else "(sem texto)"
    )

    # ============================================
    # 2️⃣ MAPEAR AUTOR
    # ============================================
    if {"id", "name"}.issubset(usuarios_df.columns) and "authorId" in comentarios_df.columns:
        mapa_nomes = usuarios_df.set_index("id")["name"]
        comentarios_df["Nome"] = comentarios_df["authorId"].map(mapa_nomes).fillna("Usuário")
    else:
        comentarios_df["Nome"] = "Usuário"

    if {"id", "imageProfilePath"}.issubset(usuarios_df.columns) and "authorId" in comentarios_df.columns:
        mapa_fotos = usuarios_df.set_index("id")["imageProfilePath"]
        comentarios_df["Foto"] = comentarios_df["authorId"].map(mapa_fotos)
    else:
        comentarios_df["Foto"] = None

    # ============================================
    # 3️⃣ DATA E POST ID
    # ============================================
    comentarios_df["Data"] = (
        comentarios_df["createdAt"]
        if "createdAt" in comentarios_df.columns
        else ""
    )

    comentarios_df["PostId"] = (
        comentarios_df["postId"]
        if "postId" in comentarios_df.columns
        else None
    )

    # ============================================
    # 4️⃣ MAPEAR POST
    # ============================================
    if {"id", "description"}.issubset(posts_df.columns):
        mapa_posts = posts_df.set_index("id")["description"]
        comentarios_df["Post"] = comentarios_df["PostId"].map(mapa_posts).fillna("Post desconhecido")
    else:
        comentarios_df["Post"] = "Post desconhecido"

    # ============================================
    # 5️⃣ ORDENAR DATA
    # ============================================
    comentarios_df["Data"] = pd.to_datetime(
        comentarios_df["Data"],
        errors="coerce"
    )

    comentarios_df = comentarios_df.sort_values("Data", ascending=False)

    # ============================================
    # 6️⃣ FILTRO
    # ============================================
    st.subheader("🔎 Filtrar por Usuário")

    nomes = sorted(comentarios_df["Nome"].dropna().unique().tolist())
    usuario_sel = st.selectbox("Selecione:", ["Todos"] + nomes)

    comentarios_filtrados = (
        comentarios_df[comentarios_df["Nome"] == usuario_sel]
        if usuario_sel != "Todos"
        else comentarios_df
    )

    # ============================================
    # 7️⃣ TABELA
    # ============================================
    st.subheader("📋 Todos os Comentários")
    st.dataframe(comentarios_filtrados, use_container_width=True)

    st.subheader("📊 Total de Comentários")
    st.metric("Quantidade total", len(comentarios_filtrados))

    # ============================================
    # 8️⃣ CARDS
    # ============================================
    st.subheader("🗂 Exibição Visual")

    for _, row in comentarios_filtrados.iterrows():
        with st.container(border=True):
            col1, col2 = st.columns([1, 9])

            # Foto
            if pd.notna(row["Foto"]) and row["Foto"]:
                foto = row["Foto"]

                if pd.notna(foto) and foto:
                    if isinstance(foto, str) and foto.startswith("/"):
                        foto = f"http://localhost:8080{foto}"

                    col1.image(foto, width=60)
                else:
                    col1.write("👤")
            else:
                col1.write("👤")

            data_formatada = (
                row["Data"].strftime("%d/%m/%Y %H:%M")
                if pd.notna(row["Data"])
                else "Sem data"
            )

            col2.markdown(f"**{row['Nome']}** — *{data_formatada}*")
            col2.markdown(f"💬 {row['Comentário']}")
            col2.caption(f"📌 Post: {row['Post']}")