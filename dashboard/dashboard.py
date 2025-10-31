import streamlit as st
import pandas as pd
import plotly.express as px
import requests
import jwt

# ========================
# CONFIGURAÇÃO INICIAL
# ========================
st.set_page_config(page_title="Dashboard SUPER ADMIN", layout="wide")
st.title("🏢 Dashboard - Super Admin ImobLink")

API_URL = "http://localhost:8080/api"

# ========================
# ESTADO DE SESSÃO
# ========================
if "token" not in st.session_state:
    st.session_state.token = None
if "user" not in st.session_state:
    st.session_state.user = None

# ========================
# FUNÇÃO DE LOGIN (FORÇADA PARA TESTES)
# ========================
def fazer_login(email, senha):
    try:
        # Chamada ao backend
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": email,
            "password": senha
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            
            if not token:
                st.error("❌ Token não retornado pelo backend.")
                return
            
            st.session_state.token = token
            
            # Decodifica o JWT para pegar informações do usuário
            import jwt
            decoded = jwt.decode(token, options={"verify_signature": False})
            
            # Força o role para SUPER_ADMIN apenas para testes
            st.session_state.user = {
                "email": decoded.get("sub"),
                "name": decoded.get("sub").split("@")[0].capitalize(),  # extrai nome do e-mail
                "role": "SUPER_ADMIN"
            }
            
            # Verifica se é Super Admin (sempre será true aqui, pois forçamos)
            if st.session_state.user.get("role") != "SUPER_ADMIN":
                st.error("🚫 Apenas Super Admins podem acessar esta dashboard.")
                st.session_state.token = None
                st.session_state.user = None
            else:
                st.success(f"✅ Login realizado com sucesso! Bem-vindo {st.session_state.user.get('name')} 👋")
                st.rerun()
        else:
            st.error("❌ Falha no login. Verifique o e-mail e a senha.")
    
    except Exception as e:
        st.error(f"Erro ao conectar ao servidor: {e}")

# ========================
# TELA DE LOGIN
# ========================
if not st.session_state.token:
    with st.form("login_form"):
        st.subheader("🔐 Login Super Admin")
        email = st.text_input("E-mail")
        senha = st.text_input("Senha", type="password")
        submitted = st.form_submit_button("Entrar")
        if submitted:
            fazer_login(email, senha)
    st.stop()

# ========================
# CABEÇALHO E LOGOUT
# ========================
st.sidebar.title("⚙️ Menu Lateral")
menu = st.sidebar.radio("Navegar entre seções:", ["🏠 Visão Geral", "📊 Gráficos", "📋 Tabelas", "🧩 Monitoramento"])

if st.sidebar.button("🚪 Sair"):
    st.session_state.token = None
    st.session_state.user = None
    st.cache_data.clear()
    st.experimental_rerun()

headers = {"Authorization": f"Bearer {st.session_state.token}"}

# ========================
# FUNÇÕES DE BUSCA DE DADOS
# ========================
@st.cache_data
def carregar_usuarios():
    try:
        resp = requests.get(f"{API_URL}/user/getAll", headers=headers)
        if resp.status_code == 200:
            return pd.DataFrame(resp.json())
        else:
            st.error(f"Erro ao carregar usuários ({resp.status_code})")
            return pd.DataFrame()
    except Exception as e:
        st.error(f"Erro: {e}")
        return pd.DataFrame()

@st.cache_data
def carregar_posts():
    try:
        resp = requests.get(f"{API_URL}/feed", headers=headers)
        if resp.status_code == 200:
            return pd.DataFrame(resp.json())
        else:
            st.error(f"Erro ao carregar posts ({resp.status_code})")
            return pd.DataFrame()
    except Exception as e:
        st.error(f"Erro: {e}")
        return pd.DataFrame()

# ========================
# CARREGAMENTO DE DADOS
# ========================
usuarios = carregar_usuarios()
posts = carregar_posts()

if usuarios.empty or posts.empty:
    st.warning("Sem dados disponíveis.")
    st.stop()

# ========================
# VISÃO GERAL
# ========================
if menu == "🏠 Visão Geral":
    st.subheader(f"📈 Métricas Gerais - Bem-vindo, {st.session_state.user.get('email')} 👋")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Usuários cadastrados", len(usuarios))
    col2.metric("Total de posts", len(posts))
    col3.metric("Preço médio (R$)", f"{posts['price'].mean():,.2f}" if 'price' in posts else "N/A")
    col4.metric("Admins/SuperAdmins", len(usuarios[usuarios['role'].isin(['ADMIN','SUPER_ADMIN'])]) if 'role' in usuarios else "N/A")
    st.divider()

    # Gráfico de posts por cidade
    if 'city' in posts:
        grafico_cidade = px.bar(
            posts.groupby("city")["id"].count().reset_index(),
            x="city", y="id", color="city", title="Posts por Cidade"
        )
        st.plotly_chart(grafico_cidade, use_container_width=True)

    # Gráfico de posts por usuário
    if 'createdBy' in posts:
        grafico_user = px.bar(
            posts.groupby("createdBy")["id"].count().reset_index(),
            x="createdBy", y="id", color="createdBy", title="Posts por Usuário"
        )
        st.plotly_chart(grafico_user, use_container_width=True)

# ========================
# GRÁFICOS
# ========================
# ========================
# GRÁFICOS
# ========================
elif menu == "📊 Gráficos":
    st.subheader("📊 Análises Visuais")
    col1, col2 = st.columns(2)

    # Adiciona coluna com endereço completo
    if all(col in posts.columns for col in ["street", "avenue", "number"]):
        posts["endereco_completo"] = posts["street"] + ", " + posts["number"] + " - " + posts["avenue"]
    else:
        posts["endereco_completo"] = "N/A"

    # Distribuição de preços por usuário
    if 'price' in posts and 'createdBy' in posts:
        grafico_preco = px.histogram(
            posts,
            x="price",
            nbins=10,
            color="createdBy",
            hover_data=["createdBy", "endereco_completo", "description"],
            title="Distribuição de preços por usuário"
        )
        col1.plotly_chart(grafico_preco, use_container_width=True)

    # Número de posts por usuário
    if 'createdBy' in posts:
        grafico_user = px.bar(
            posts.groupby("createdBy")["id"].count().reset_index(),
            x="createdBy",
            y="id",
            color="createdBy",
            text="id",
            title="Posts por usuário"
        )
        grafico_user.update_traces(textposition="outside")
        col2.plotly_chart(grafico_user, use_container_width=True)

    # Número de posts por rua
    if 'street' in posts:
        st.divider()
        # Agrupa posts por rua
        df_rua = posts.groupby("street")["id"].count().reset_index()
        df_rua.rename(columns={"id": "qtd_posts"}, inplace=True)

        # Gráfico de pizza
        grafico_pizza = px.pie(
            df_rua,
            names="street",       # fatias da pizza
            values="qtd_posts",   # tamanho das fatias
            title="Número de posts por rua",
            hover_data=["qtd_posts"], 
            color="street"        # cores diferentes para cada rua
        )
        grafico_pizza.update_traces(textposition="inside", textinfo="percent+label")
        st.plotly_chart(grafico_pizza, use_container_width=True)


# ========================
# TABELAS
# ========================
elif menu == "📋 Tabelas":
    st.subheader("👥 Usuários Cadastrados")
    st.dataframe(usuarios, use_container_width=True)

    st.divider()
    st.subheader("🏠 Posts Cadastrados")
    st.dataframe(posts, use_container_width=True)

# ========================
# MONITORAMENTO / LOGS
# ========================
elif menu == "🧩 Monitoramento":
    st.subheader("🧩 Monitoramento e Logs do Sistema")
    st.markdown("**Logs recentes:** Em breve integração real com backend")

# ========================
# Rodar: python -m streamlit run Dashboard.py
# ========================
