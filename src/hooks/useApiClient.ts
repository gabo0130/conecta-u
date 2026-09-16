import { apiClient } from "@/apis/client";
import { AxiosRequestConfig } from "axios";

/**
 * Hook para realizar peticiones HTTP autenticadas
 * Incluye automáticamente el token JWT en el header
 */
export function useApiClient() {
  return {
    get: (url: string, config?: AxiosRequestConfig) =>
      apiClient.get(url, config),
    post: (url: string, data?: any, config?: AxiosRequestConfig) =>
      apiClient.post(url, data, config),
    put: (url: string, data?: any, config?: AxiosRequestConfig) =>
      apiClient.put(url, data, config),
    patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
      apiClient.patch(url, data, config),
    delete: (url: string, config?: AxiosRequestConfig) =>
      apiClient.delete(url, config),
  };
}
