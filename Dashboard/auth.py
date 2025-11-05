import streamlit as st
import requests
import jwt
from utils import extract_token_from_response_json


def fazer_login(email: str, senha: str, api_url: str):
    try:
        r = requests.post(f"{api_url}/auth/login", json={"email": email, "password": senha}, timeout=8)
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

    # 🔹 Salva token no estado de sessão
    st.session_state.token = token

    # 🔹 Decodifica sem verificar assinatura
    try:
        claims = jwt.decode(token, options={"verify_signature": False})
    except Exception:
        claims = {}

    # 🔹 Carrega dados básicos do JWT
    st.session_state.user = {
        "email": claims.get("sub") or claims.get("email"),
        "role": claims.get("role") or "USER",
        "name": claims.get("name") or "Usuário",
    }

    # 🔹 Se role não veio no token, tenta obter do backend
    if st.session_state.user["role"] == "USER":
        try:
            resp = requests.get(f"{api_url}/user/account", headers={"Authorization": f"Bearer {token}"}, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                st.session_state.user["role"] = data.get("role", "USER")
                st.session_state.user["name"] = data.get("name", st.session_state.user["name"])
        except Exception:
            pass

    # 🔹 Verifica permissão
    role = str(st.session_state.user["role"]).upper()
    if "SUPER_ADMIN" not in role and "ADMIN" not in role:
        st.error(f"🚫 Acesso negado — apenas SUPER_ADMIN ou ADMIN. (Role detectada: {role})")
        st.session_state.token = None
        st.session_state.last_login_ok = False
        return

    st.success(f"✅ Login bem-sucedido! Bem-vindo {st.session_state.user['name']}")
    st.session_state.last_login_ok = True


def login_component(api_url: str):
    if "token" not in st.session_state:
        st.session_state.token = None
    if "last_login_ok" not in st.session_state:
        st.session_state.last_login_ok = False

    with st.sidebar.expander("🔐 Login"):
        if not st.session_state.token:
            email = st.text_input("E-mail")
            senha = st.text_input("Senha", type="password")
            if st.button("Entrar"):
                fazer_login(email, senha, api_url)
        else:
            st.markdown(f"**Logado como:** {st.session_state.user.get('name')} ({st.session_state.user.get('role')})")
            if st.button("Logout"):
                st.session_state.token = None
                st.session_state.last_login_ok = False
                st.experimental_rerun()
