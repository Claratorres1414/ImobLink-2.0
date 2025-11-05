import streamlit as st
import pandas as pd

def pagina_tabelas(usuarios: pd.DataFrame, posts: pd.DataFrame):
    st.subheader("📋 Tabelas")
    st.markdown("### Usuários")

    if not usuarios.empty:
        st.dataframe(usuarios, use_container_width=True)
        st.markdown("**Selecione um usuário na aba '👤 Usuário Específico' para ver detalhes.**")
    else:
        st.info("Nenhum usuário carregado.")

    st.divider()
    st.markdown("### Posts (feed)")

    if not posts.empty:
        display_posts = posts.copy()
        if all(c in display_posts.columns for c in ["street", "number", "avenue"]):
            display_posts["endereco_completo"] = display_posts["street"].astype(str) + ", " + display_posts["number"].astype(str) + " - " + display_posts["avenue"].astype(str)
        st.dataframe(display_posts, use_container_width=True)
    else:
        st.info("Nenhum post carregado.")
