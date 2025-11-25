import streamlit as st
import requests
import jwt
from utils import extract_token_from_response_json


def fazer_login(email: str, senha: str, api_url: str):
    try:
        # 🔥 Agora usando a rota exclusiva do ADM
        r = requests.post(f"{api_url}/auth/adm/login", json={"email": email, "password": senha}, timeout=8)
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

    st.session_state.token = token

    try:
        claims = jwt.decode(token, options={"verify_signature": False})
    except Exception:
        claims = {}

    st.session_state.user = {
        "email": claims.get("sub") or claims.get("email"),
        "role": claims.get("role") or "ADMIN",  # 🔥 Se vier nulo, já assume ADMIN
        "name": claims.get("name") or "Administrador",
    }

    st.success(f"✅ Login de ADM bem-sucedido! Bem-vindo {st.session_state.user['name']}")
    st.session_state.last_login_ok = True
    st.rerun()

def login_component(api_url: str):
    if "token" not in st.session_state:
        st.session_state.token = None
    if "last_login_ok" not in st.session_state:
        st.session_state.last_login_ok = False

    with st.sidebar.expander("🔐 Login"):
        if not st.session_state.token:
            email = st.text_input("E-mail", key="login_email")
            senha = st.text_input("Senha", type="password", key="login_senha")

            if st.button("Entrar"):
                if not email or not senha:
                    st.warning("Preencha todos os campos antes de entrar.")
                else:
                    fazer_login(email, senha, api_url)

        else:
            st.markdown(f"**Logado como:** {st.session_state.user.get('name')} ({st.session_state.user.get('role')})")
            if st.button("Logout"):
                st.session_state.token = None
                st.session_state.last_login_ok = False
                st.rerun()

