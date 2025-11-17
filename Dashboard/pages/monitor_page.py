import streamlit as st
import pandas as pd

def pagina_monitoramento():
    st.subheader("🧩 Monitoramento e Logs (simulado)")
    st.info("Integração com logs reais pode ser adicionada futuramente.")

    st.table(pd.DataFrame([
        {"Data": "2025-10-30", "Evento": "Novo post criado", "Usuário": "maria@teste.com"},
        {"Data": "2025-10-29", "Evento": "Falha de login (401)", "Usuário": "joao@teste.com"},
    ]))
