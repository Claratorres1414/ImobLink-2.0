import streamlit as st
import pandas as pd
import plotly.express as px

# ===========================
# CONFIGURAÇÃO INICIAL
# ===========================
st.set_page_config(page_title="Dashboard Imobiliária", layout="wide")
st.title("🏠 Dashboard - Imobiliária")
st.markdown("Painel de controle com métricas e estatísticas do sistema.")

# ===========================
# DADOS FICTÍCIOS (PROTÓTIPO)
# ===========================
imoveis_df = pd.DataFrame({
    "id": range(1, 11),
    "tipo": ["Casa", "Apartamento", "Casa", "Terreno", "Apartamento", "Sala Comercial", "Casa", "Apartamento", "Casa", "Terreno"],
    "cidade": ["São Paulo", "Rio de Janeiro", "Curitiba", "São Paulo", "Belo Horizonte", "São Paulo", "Curitiba", "Recife", "Rio de Janeiro", "Fortaleza"],
    "valor": [500000, 750000, 430000, 250000, 680000, 350000, 520000, 800000, 470000, 260000],
    "vendas": [5, 7, 2, 0, 6, 1, 3, 9, 4, 0],
})

usuarios_df = pd.DataFrame({
    "id": range(1, 6),
    "nome": ["Ana", "Bruno", "Carla", "Diego", "Eduarda"],
    "cidade": ["São Paulo", "Curitiba", "Belo Horizonte", "Recife", "Rio de Janeiro"],
    "imoveis_cadastrados": [3, 2, 1, 4, 2],
})

# ===========================
# MÉTRICAS PRINCIPAIS
# ===========================
col1, col2, col3 = st.columns(3)
col1.metric("🏘️ Total de Imóveis", len(imoveis_df))
col2.metric("👥 Total de Usuários", len(usuarios_df))
col3.metric("💰 Valor Total dos Imóveis", f"R$ {imoveis_df['valor'].sum():,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))

st.divider()

# ===========================
# GRÁFICOS
# ===========================
col1, col2 = st.columns(2)

# Distribuição por tipo
fig_tipo = px.pie(imoveis_df, names="tipo", title="Distribuição de Tipos de Imóveis")
col1.plotly_chart(fig_tipo, use_container_width=True)

# Média de valor por cidade
media_cidade = imoveis_df.groupby("cidade")["valor"].mean().reset_index()
fig_cidade = px.bar(media_cidade, x="cidade", y="valor", title="Média de Valor por Cidade", text_auto=True)
col2.plotly_chart(fig_cidade, use_container_width=True)

st.divider()

# ===========================
# TABELAS
# ===========================
st.subheader("📋 Lista de Imóveis Cadastrados")
st.dataframe(imoveis_df, use_container_width=True)

st.subheader("👤 Usuários Ativos")
st.dataframe(usuarios_df, use_container_width=True)

#python -m streamlit run Dashboard.py
