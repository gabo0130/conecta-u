/** URL base de la API (sin dependencias, para que la usen tanto apiClient como el chequeo de /health). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

/** Número positivo de una variable de entorno; si falta o es inválida, el valor por defecto. */
export function positiveNumber(value: string | undefined, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

// Tiempos del front. Se configuran con variables de entorno (Vercel / `.env.local`); Next las fija
// al compilar, así que cambiarlas exige un nuevo despliegue. Sin variable, el valor por defecto.

/** Timeout de una petición normal a la API. */
export const API_TIMEOUT_MS = positiveNumber(process.env.NEXT_PUBLIC_API_TIMEOUT_MS, 15_000);

/**
 * Timeout de las peticiones que esperan a la IA en la misma respuesta (generar recomendaciones,
 * guardar un perfil que recalcula su embedding). Debe superar lo que el backend les da a esos pasos.
 */
export const AI_REQUEST_TIMEOUT_MS = positiveNumber(process.env.NEXT_PUBLIC_AI_REQUEST_TIMEOUT_MS, 60_000);

/** Cada cuánto se consulta un análisis que corre en segundo plano. */
export const ANALYSIS_POLL_INTERVAL_MS = positiveNumber(process.env.NEXT_PUBLIC_ANALYSIS_POLL_INTERVAL_MS, 3_000);

/**
 * Hasta cuándo se espera un análisis. Debe superar `AI_TIMEOUT_MS` del backend más su minuto de
 * margen: pasado eso, el servidor ya lo dio por interrumpido.
 */
export const ANALYSIS_MAX_WAIT_MS = positiveNumber(process.env.NEXT_PUBLIC_ANALYSIS_MAX_WAIT_MS, 180_000);
