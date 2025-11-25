import streamlit as st
import requests
import jwt
from auth_state import save_token_url, load_token_url, clear_token_url
from utils import extract_token_from_response_json


# -----------------------------------------------------
# 🔥 1) RECONSTRÓI ESTADO SE TOKEN VEIO DA URL
# -----------------------------------------------------
def reconstruir_usuario(token):
    try:
        claims = jwt.decode(token, options={"verify_signature": False})
    except:
        claims = {}

    return {
        "email": claims.get("sub"),
        "role": claims.get("role", "ADMIN"),
        "name": claims.get("name", "Administrador")
    }


# Se já existir token na URL e não no session_state → restaurar
url_token = load_token_url()

# 🔧 Corrige caso venha lista
if isinstance(url_token, list):
    url_token = url_token[0]

if url_token and "token" not in st.session_state:
    st.session_state.token = url_token
    try:
        claims = jwt.decode(url_token, options={"verify_signature": False})
        st.session_state.user = {
            "email": claims.get("sub"),
            "name": claims.get("name"),
            "role": claims.get("role")
        }
        st.session_state.last_login_ok = True
    except:
        st.session_state.token = None



# -----------------------------------------------------
# 🔥 2) FUNÇÃO DE LOGIN
# -----------------------------------------------------
def fazer_login(email: str, senha: str, api_url: str):
    try:
        r = requests.post(f"{api_url}/auth/adm/login",
                          json={"email": email, "password": senha},
                          timeout=8)
    except Exception as e:
        st.error(f"Erro ao conectar ao backend: {e}")
        return

    if r.status_code != 200:
        st.error("Falha no login. Verifique credenciais.")
        return

    data = r.json()
    token = extract_token_from_response_json(data)
    if not token:
        st.error("Token não encontrado na resposta.")
        return

    # Salva token
    st.session_state.token = token
    save_token_url(token)

    # Cria usuário no estado
    st.session_state.user = reconstruir_usuario(token)

    st.session_state.last_login_ok = True
    st.success("Login bem-sucedido!")

    st.rerun()


# -----------------------------------------------------
# 🔥 3) COMPONENTE DE LOGIN
# -----------------------------------------------------
def login_component(api_url: str):

    if "token" not in st.session_state:
        st.session_state.token = None

    if "last_login_ok" not in st.session_state:
        st.session_state.last_login_ok = False

    if "user" not in st.session_state:
        st.session_state.user = None

    with st.sidebar.expander("🔐 Login"):
        # Se NÃO estiver logado
        if not st.session_state.token:
            email = st.text_input("E-mail")
            senha = st.text_input("Senha", type="password")

            if st.button("Entrar"):
                fazer_login(email, senha, api_url)

        # Se estiver logado
        else:
            user = st.session_state.user or {}
            st.markdown(
                f"**Logado como:** {user.get('name', '---')} ({user.get('role', '---')})"
            )

            if st.button("Logout"):
                st.session_state.token = None
                st.session_state.user = None
                st.session_state.last_login_ok = False
                clear_token_url()
                st.rerun()
