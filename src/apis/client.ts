import axios, { AxiosError } from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

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