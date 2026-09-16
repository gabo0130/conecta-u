import axios, { AxiosError } from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4001/api";

export const apiClient = axios.create({
  baseURL,
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
    if (error.response?.status === 401) {
      // Token inválido o expirado
      if (typeof window !== "undefined") {
        // Limpiar localStorage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");

        // Redirigir al login
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);