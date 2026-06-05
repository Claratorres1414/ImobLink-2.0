// src/services/api.js
import axios from "axios";
import { API_URL, TOKEN_KEY } from "../config/constants";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor: injeta o token JWT automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata erros globais (token expirado → redireciona para login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;