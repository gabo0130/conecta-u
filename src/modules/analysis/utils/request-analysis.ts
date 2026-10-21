import { isAxiosError } from "axios";
import { AI_REQUEST_CONFIG, apiClient, isTimeoutError } from "@/apis/client";
import type { ProjectAnalysis } from "@/apis/interfaces/analysis";

export const ANALYSIS_TIMEOUT_MESSAGE =
  "El análisis está tardando más de lo esperado. Puede que termine en unos minutos: actualiza la página para ver si ya está listo.";

/**
 * Pide un análisis nuevo (POST síncrono, hasta ~60 s). Solo si el navegador lo corta por tiempo,
 * el análisis pudo terminar igual en el servidor: se consulta el último una vez y se usa si es
 * distinto del que había antes (`previousId`). Cualquier otro fallo (sin red, 503, 409, 422) se
 * propaga tal cual, y si la consulta de respaldo falla se muestra el error original.
 */
export async function requestAnalysis(projectId: string, previousId: string | null): Promise<ProjectAnalysis> {
  try {
    const response = await apiClient.post<ProjectAnalysis>(`/projects/${projectId}/analysis`, undefined, AI_REQUEST_CONFIG);
    return response.data;
  } catch (error) {
    if (!isTimeoutError(error)) throw error;
    let latest: ProjectAnalysis | null;
    try {
      latest = await fetchLatestAnalysis(projectId);
    } catch {
      throw error;
    }
    if (latest && latest.id !== previousId) return latest;
    throw new Error(ANALYSIS_TIMEOUT_MESSAGE);
  }
}

/** Último análisis COMPLETADO o null si el proyecto aún no tiene (404). */
export async function fetchLatestAnalysis(projectId: string): Promise<ProjectAnalysis | null> {
  try {
    const response = await apiClient.get<ProjectAnalysis>(`/projects/${projectId}/analysis`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}
