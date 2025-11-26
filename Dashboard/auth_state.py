import streamlit as st

def save_token_url(token: str):
    st.query_params["auth"] = token

def load_token_url():
    params = st.query_params
    token = params.get("auth", None)

    # Sempre retornar string
    if isinstance(token, list):
        return token[0]
    return token

def clear_token_url():
    st.query_params.clear()
