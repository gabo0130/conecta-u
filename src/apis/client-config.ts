/** URL base de la API (sin dependencias, para que la usen tanto apiClient como el chequeo de /health). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";
