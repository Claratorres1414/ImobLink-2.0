import streamlit as st
from auth import login_component
from data_loaders import carregar_todos_dados
from pages.overview_page import pagina_visao_geral
from pages.charts_page import pagina_graficos
from pages.tables_page import pagina_tabelas
from pages.user_page import pagina_usuario
from pages.monitor_page import pagina_monitoramento

st.set_page_config(page_title="Dashboard SUPER ADMIN", layout="wide")
st.title("🏢 Dashboard - Super Admin ImobLink")

API_URL = "http://localhost:8080/api"

# ========================
# LOGIN
# ========================
login_component(API_URL)

if not st.session_state.token or not st.session_state.last_login_ok:
    st.info("Por favor, faça login no painel lateral para acessar os dados.")
    st.stop()

# ========================
# MENU
# ========================
st.sidebar.title("⚙️ Menu Lateral")
menu = st.sidebar.radio(
    "Navegar:",
    ["🏠 Visão Geral", "📊 Gráficos", "📋 Tabelas", "👤 Usuário Específico", "🧩 Monitoramento"]
)

# ========================
# CARREGAMENTO DE DADOS
# ========================
usuarios, posts, followers_df, followings_df, my_favs_df = carregar_todos_dados(API_URL, st.session_state.token)

# ========================
# ROTAS DE PÁGINAS
# ========================
if menu == "🏠 Visão Geral":
    pagina_visao_geral(usuarios, posts)
elif menu == "📊 Gráficos":
    pagina_graficos(posts)
elif menu == "📋 Tabelas":
    pagina_tabelas(usuarios, posts)
elif menu == "👤 Usuário Específico":
    pagina_usuario(API_URL, usuarios, posts, st.session_state.token)
elif menu == "🧩 Monitoramento":
    pagina_monitoramento()

#python -m streamlit run Dashboard.py 