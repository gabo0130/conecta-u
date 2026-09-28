import { isAxiosError } from "axios";

export const NETWORK_ERROR_MESSAGE =
  "No hay conexión con el servidor. Revisa tu internet o espera a que el servidor termine de arrancar.";
export const TIMEOUT_ERROR_MESSAGE = "El servidor tardó demasiado en responder. Intenta de nuevo en un momento.";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message[0] ?? fallback;
    }
    if (message) {
      return message;
    }
    // Sin respuesta del servidor: axios trae textos en inglés ("Network Error"), se traducen.
    if (!error.response) {
      return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? TIMEOUT_ERROR_MESSAGE
        : NETWORK_ERROR_MESSAGE;
    }
    // Respuesta sin mensaje propio: el texto de axios ("Request failed with status code 500") no sirve.
    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
