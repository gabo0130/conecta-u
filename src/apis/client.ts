import axios, { AxiosError } from "axios";
import { reportUnreachable } from "@/utils/service-status";
import { API_BASE_URL } from "./client-config";

// Respuestas del proxy del hosting mientras el servidor arranca o está caído.
const WAKING_STATUSES = new Set([502, 503, 504]);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Agregar token a todas las solicitudes
apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor: Manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Sin respuesta (red caída o timeout) o 502/503/504: el servidor puede estar apagándose o
    // arrancando; se muestra el aviso global y se reintenta /health hasta que responda.
    const status = error.response?.status;
    if (!error.response || (status !== undefined && WAKING_STATUSES.has(status))) {
      reportUnreachable();
    }

    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

    // Solo forzar logout si la petición llevaba un token (sesión expirada/inválida).
    // Un 401 sin token es una respuesta normal de /auth/login o /auth/register
    // con credenciales incorrectas, y debe mostrarse como error en el formulario.
    if (error.response?.status === 401 && hadAuthHeader) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);