import streamlit as st
from ml_client import treinar_popularidade, prever_feed_completo

def pagina_popularidade(posts):
    st.header("🔥 Previsão de Popularidade dos Posts")

    # Converter DataFrame -> lista de dicts
    posts_json = posts.to_dict(orient="records")

    if st.button("📚 Treinar Modelo com Posts Atuais"):
        resultado = treinar_popularidade(posts_json)
        st.success(resultado)

    st.divider()

    if st.button("🔮 Prever Popularidade de Todos os Posts"):
        preds = prever_feed_completo(posts_json)
        st.session_state.predicoes = preds
        st.success("Previsões geradas!")

    st.divider()

    if "predicoes" in st.session_state:
        predicoes = st.session_state.predicoes
        st.dataframe(predicoes)
