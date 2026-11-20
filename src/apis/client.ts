import axios, { AxiosError, isAxiosError, type AxiosRequestConfig } from "axios";
import { reportUnreachable } from "@/utils/service-status";
import { AI_REQUEST_TIMEOUT_MS, API_BASE_URL, API_TIMEOUT_MS } from "./client-config";

declare module "axios" {
  interface AxiosRequestConfig {
    /**
     * Petición que espera a la IA. Su 503 ("la IA no está disponible") y su timeout son de la IA,
     * no del servidor: no avisan "el servidor está despertando". Los 502/504 del proxy y la falta
     * de red sí avisan, como en cualquier otra petición.
     */
    aiRequest?: boolean;
  }
}

// Respuestas del proxy del hosting mientras el servidor arranca o está caído.
const WAKING_STATUSES = new Set([502, 503, 504]);

/**
 * Peticiones que esperan a la IA dentro de la misma respuesta: generar recomendaciones y guardar
 * perfiles que recalculan su embedding. El análisis no: corre en segundo plano y se consulta
 * (`request-analysis.ts`). El timeout global no alcanza para estas (`NEXT_PUBLIC_AI_REQUEST_TIMEOUT_MS`).
 */
export const AI_REQUEST_CONFIG: AxiosRequestConfig = {
  timeout: AI_REQUEST_TIMEOUT_MS,
  aiRequest: true,
};

/** El navegador cortó la petición por tiempo (no es lo mismo que no tener red). */
export function isTimeoutError(error: unknown): boolean {
  return isAxiosError(error) && !error.response && (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");
}

/** El fallo es de la IA (503 o timeout de una petición de IA), no del servidor. */
function isAiFailure(error: AxiosError): boolean {
  return Boolean(error.config?.aiRequest) && (error.response?.status === 503 || isTimeoutError(error));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
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
    // Petición cancelada a propósito (AbortController): no es un fallo del servidor.
    if (axios.isCancel(error)) return Promise.reject(error);

    // Sin respuesta (red caída o timeout) o 502/503/504: el servidor puede estar apagándose o
    // arrancando; se muestra el aviso global y se reintenta /health hasta que responda.
    const status = error.response?.status;
    const looksAsleep = !error.response || (status !== undefined && WAKING_STATUSES.has(status));
    if (looksAsleep && !isAiFailure(error)) {
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