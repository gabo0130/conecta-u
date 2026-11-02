import axios, { isAxiosError } from "axios";
import { apiClient } from "./client";

export type SharedRequest<T> = {
  /** Devuelve la respuesta compartida; con `refresh` la vuelve a pedir al backend. */
  get: (options?: { refresh?: boolean }) => Promise<T>;
  /** Olvida la respuesta guardada (tests o cambios hechos desde la app). */
  clear: () => void;
};

/** Esperas antes de cada reintento ante un fallo pasajero (el backend gratuito tarda en despertar). */
export const SHARED_REQUEST_RETRY_DELAYS_MS = [1000, 3000];

const TRANSIENT_STATUSES = new Set([502, 503, 504]);

/** Sin respuesta (red, timeout) o el proxy dice que el servidor no está: vale la pena reintentar. */
function isTransient(error: unknown): boolean {
  if (!isAxiosError(error) || axios.isCancel(error)) return false;
  return !error.response || TRANSIENT_STATUSES.has(error.response.status);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getWithRetry<T>(url: string): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await apiClient.get<T>(url);
      return response.data;
    } catch (error) {
      const delay = SHARED_REQUEST_RETRY_DELAYS_MS[attempt];
      if (delay === undefined || !isTransient(error)) throw error;
      await wait(delay);
    }
  }
}

/**
 * GET compartido por toda la pestaña: la primera llamada pide al backend y las demás reutilizan la
 * misma promesa. Solo para catálogos que casi no cambian (programas, tipos y categorías de proyecto),
 * para que la vista, el formulario y los modales de una pantalla no pidan lo mismo cada uno.
 * Ante un fallo pasajero reintenta solo; un 4xx falla de inmediato.
 */
export function createSharedRequest<T>(url: string): SharedRequest<T> {
  let request: Promise<T> | null = null;

  const get = ({ refresh = false } = {}) => {
    if (!request || refresh) {
      const pending = getWithRetry<T>(url);
      request = pending;
      // Un fallo no se guarda: el siguiente intento vuelve a pedirlo.
      pending.catch(() => {
        if (request === pending) request = null;
      });
    }
    return request;
  };

  return { get, clear: () => (request = null) };
}
