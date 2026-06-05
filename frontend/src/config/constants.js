// src/config/constants.js

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const MICROSERVICES_URL = import.meta.env.VITE_MICROSERVICES_URL || "http://localhost:8000";

export const TOKEN_KEY = "imoblink_token";

export const APP_ENV = import.meta.env.VITE_APP_ENV || "development";