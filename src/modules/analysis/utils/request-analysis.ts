import { isAxiosError } from "axios";
import { apiClient } from "@/apis/client";
import { ANALYSIS_MAX_WAIT_MS, ANALYSIS_POLL_INTERVAL_MS } from "@/apis/client-config";
import type { AnalysisHistoryResponse, AnalysisSummary, ProjectAnalysis } from "@/apis/interfaces/analysis";

export const ANALYSIS_TIMEOUT_MESSAGE =
  "El análisis está tardando más de lo esperado. Sigue en curso: vuelve en unos minutos para ver el resultado.";
export const ANALYSIS_FAILED_MESSAGE = "No se pudo completar el análisis. Intenta de nuevo.";

/** Consultas fallidas seguidas (sin red, servidor reiniciando) que se toleran antes de rendirse. */
const MAX_POLL_FAILURES = 5;

type WaitOptions = {
  /** Se aborta al salir de la página: deja de consultar sin marcar error. */
  signal?: AbortSignal;
  /** Para pruebas: cuánto esperar entre consultas. */
  intervalMs?: number;
};

/**
 * Pide un análisis nuevo y espera su resultado. El POST responde de inmediato con el análisis
 * PENDIENTE (202): la IA corre en segundo plano en el servidor, así que el análisis no depende
 * de que esta pestaña, la red o un proxy aguanten minutos esperando. Los errores del POST
 * (sin red, 503, 409, 422) se propagan tal cual.
 */
export async function requestAnalysis(projectId: string, options: WaitOptions = {}): Promise<ProjectAnalysis> {
  const response = await apiClient.post<AnalysisSummary>(`/projects/${projectId}/analysis`);
  return waitForAnalysis(projectId, response.data.id, options);
}

/**
 * Consulta el intento hasta que termina. COMPLETADO → el análisis con sus perfiles; ERROR → el
 * mensaje que guardó el backend. Tolera unas pocas consultas fallidas seguidas (el análisis sigue
 * en el servidor aunque se corte la red un momento).
 */
export async function waitForAnalysis(
  projectId: string,
  analysisId: string,
  { signal, intervalMs }: WaitOptions = {},
): Promise<ProjectAnalysis> {
  const interval = intervalMs ?? ANALYSIS_POLL_INTERVAL_MS;
  const giveUpAt = Date.now() + ANALYSIS_MAX_WAIT_MS;
  let failures = 0;
  for (;;) {
    await sleep(interval, signal);
    let attempt: ProjectAnalysis;
    try {
      const response = await apiClient.get<ProjectAnalysis>(`/projects/${projectId}/analyses/${analysisId}`, {
        signal,
      });
      attempt = response.data;
      failures = 0;
    } catch (error) {
      if (signal?.aborted) throw error;
      // Un 4xx no se arregla esperando (p. ej. el análisis ya no existe).
      if (isAxiosError(error) && error.response && error.response.status < 500) throw error;
      failures++;
      if (failures >= MAX_POLL_FAILURES) throw error;
      continue;
    }
    if (attempt.status === "COMPLETADO") return attempt;
    if (attempt.status === "ERROR") throw new Error(attempt.errorMessage ?? ANALYSIS_FAILED_MESSAGE);
    if (Date.now() >= giveUpAt) throw new Error(ANALYSIS_TIMEOUT_MESSAGE);
  }
}

/** El análisis que está corriendo para el proyecto (otra pestaña, o se salió de la página), o null. */
export async function findRunningAnalysis(projectId: string): Promise<AnalysisSummary | null> {
  const response = await apiClient.get<AnalysisHistoryResponse>(`/projects/${projectId}/analyses`, {
    params: { page: 1, pageSize: 1 },
  });
  const [latest] = response.data.analyses;
  return latest?.status === "PENDIENTE" ? latest : null;
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

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
