import { apiClient } from "./client";

export type SharedRequest<T> = {
  /** Devuelve la respuesta compartida; con `refresh` la vuelve a pedir al backend. */
  get: (options?: { refresh?: boolean }) => Promise<T>;
  /** Olvida la respuesta guardada (tests o cambios hechos desde la app). */
  clear: () => void;
};

/**
 * GET compartido por toda la pestaña: la primera llamada pide al backend y las demás reutilizan la
 * misma promesa. Solo para catálogos que casi no cambian (programas, tipos y categorías de proyecto),
 * para que la vista, el formulario y los modales de una pantalla no pidan lo mismo cada uno.
 */
export function createSharedRequest<T>(url: string): SharedRequest<T> {
  let request: Promise<T> | null = null;

  const get = ({ refresh = false } = {}) => {
    if (!request || refresh) {
      const pending = apiClient.get<T>(url).then((response) => response.data);
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
