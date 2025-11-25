import streamlit as st
from auth import login_component, reconstruir_usuario
from auth_state import load_token_url, save_token_url
from data_loaders import carregar_todos_dados
from pages.overview_page import pagina_visao_geral
from pages.charts_page import pagina_graficos
from pages.tables_page import pagina_tabelas
from pages.user_page import pagina_usuario
from pages.monitor_page import pagina_monitoramento

st.set_page_config(page_title="Dashboard SUPER ADMIN", layout="wide")
st.title("🏢 Dashboard - Super Admin ImobLink")

API_URL = "http://localhost:8080/api"

# ======================================================
# 1) 🟦 RESTAURAR TOKEN DA URL ANTES DE TUDO
# ======================================================
if "token" not in st.session_state:
    st.session_state.token = None

if "user" not in st.session_state:
    st.session_state.user = None

if "last_login_ok" not in st.session_state:
    st.session_state.last_login_ok = False

url_token = load_token_url()
if url_token and not st.session_state.token:
    st.session_state.token = url_token
    st.session_state.user = reconstruir_usuario(url_token)
    st.session_state.last_login_ok = True

# ======================================================
# 2) 🟩 LOGIN (agora sim pode chamar)
# ======================================================
login_component(API_URL)

# Se ainda não tiver token → bloquear
if not st.session_state.token or not st.session_state.last_login_ok:
    st.info("Por favor, faça login no painel lateral para acessar os dados.")
    st.stop()

# ======================================================
# 3) 🟨 MENU
# ======================================================
st.sidebar.title("⚙️ Menu Lateral")
menu = st.sidebar.radio(
    "Navegar:",
    ["🏠 Visão Geral", "📊 Gráficos", "📋 Tabelas",
     "👤 Usuário Específico", "🧩 Monitoramento", "💬 Comentários"]
)

# ======================================================
# 4) 🟧 CARREGAR DADOS
# ======================================================
usuarios, posts, followers_df, followings_df, my_favs_df, comentarios_df = carregar_todos_dados(
    API_URL, st.session_state.token
)

# ======================================================
# 5) 🟥 ROTAS DAS PÁGINAS
# ======================================================
if menu == "🏠 Visão Geral":
    pagina_visao_geral(usuarios, posts)
elif menu == "📊 Gráficos":
    pagina_graficos(posts)
elif menu == "📋 Tabelas":
    pagina_tabelas(usuarios, posts, API_URL, st.session_state.token)
elif menu == "👤 Usuário Específico":
    pagina_usuario(API_URL, usuarios, posts, st.session_state.token)
elif menu == "🧩 Monitoramento":
    pagina_monitoramento()
elif menu == "💬 Comentários":
    from pages.comments_page import pagina_comentarios
    pagina_comentarios(comentarios_df, usuarios, posts)

#python -m streamlit run Dashboard.py 