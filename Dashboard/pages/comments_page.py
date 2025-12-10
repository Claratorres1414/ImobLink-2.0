import streamlit as st
import pandas as pd

def pagina_comentarios(comentarios_df, usuarios_df, posts_df):

    st.header("💬 Comentários da ImobLink")

    if comentarios_df.empty:
        st.warning("Nenhum comentário encontrado.")
        return

    # ============================================
    # 1️⃣ Detectar automaticamente qual coluna contém o texto do comentário
    # ============================================

    coluna_comentario = None
    for c in ["comment", "comentario", "content", "text", "mensagem"]:
        if c in comentarios_df.columns:
            coluna_comentario = c
            break

    if coluna_comentario:
        comentarios_df["Comentário"] = comentarios_df[coluna_comentario].fillna("(sem texto)")
    else:
        comentarios_df["Comentário"] = "(sem texto)"

    # Nome do autor
    comentarios_df["Nome"] = comentarios_df.get("autorNome", "Usuário")

    # Foto
    comentarios_df["Foto"] = comentarios_df.get("autorImagem", None)

    # Data
    comentarios_df["Data"] = comentarios_df.get("createdAt", "")

    # PostId
    comentarios_df["PostId"] = comentarios_df.get("postId", None)

    # ============================================
    # 2️⃣ MAPEAR NOME DO POST
    # ============================================

    if "description" in posts_df.columns:
        comentarios_df["Post"] = comentarios_df["PostId"].map(
            posts_df.set_index("id")["description"]
        )
    else:
        comentarios_df["Post"] = "Post desconhecido"

    # ============================================
    # 3️⃣ ORDENAR POR DATA
    # ============================================

    try:
        comentarios_df["Data"] = pd.to_datetime(comentarios_df["Data"])
        comentarios_df = comentarios_df.sort_values("Data", ascending=False)
    except:
        pass

    # ============================================
    # 4️⃣ FILTRO POR USUÁRIO (agora em cima!)
    # ============================================

    st.subheader("🔎 Filtrar por Usuário")

    nomes = comentarios_df["Nome"].dropna().unique().tolist()
    usuario_sel = st.selectbox("Selecione:", ["Todos"] + nomes)

    if usuario_sel != "Todos":
        comentarios_filtrados = comentarios_df[comentarios_df["Nome"] == usuario_sel]
    else:
        comentarios_filtrados = comentarios_df

    # ============================================
    # 5️⃣ TABELA
    # ============================================

    st.subheader("📋 Todos os Comentários")
    st.dataframe(comentarios_filtrados, use_container_width=True)

    st.subheader("📊 Total de Comentários")
    st.metric("Quantidade total", len(comentarios_filtrados))

    # ============================================
    # 6️⃣ CARDS DE EXIBIÇÃO
    # ============================================

    st.subheader("🗂 Exibição Visual")

    for _, row in comentarios_filtrados.iterrows():
        with st.container(border=True):
            col1, col2 = st.columns([1, 9])

            # Foto
            if pd.notna(row["Foto"]) and row["Foto"]:
                col1.image(row["Foto"], width=60)
            else:
                col1.write("👤")

            # Nome + data
            col2.markdown(f"**{row['Nome']}** — *{row['Data']}*")

            # Comentário (agora SEMPRE aparece se existir)
            col2.markdown(f"💬 {row['Comentário']}")

            # Nome do post
            col2.caption(f"📌 Post: {row['Post']}")
