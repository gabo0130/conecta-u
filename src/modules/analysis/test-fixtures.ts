import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import type { ProjectAnalysis, RequiredProfile } from "@/apis/interfaces/analysis";

// Datos de prueba ficticios con la forma exacta del contrato (§12).

export const AI_PROFILE: RequiredProfile = {
  id: "rp1",
  source: "IA",
  name: "Desarrollador de Hardware e IoT",
  description: "Diseña los sensores del prototipo.",
  justification: "El proyecto mide el desperdicio con sensores conectados.",
  quantity: 2,
  priority: "ALTA",
  minWeeklyHours: 10,
  position: 0,
  active: true,
  skills: [
    { id: "k1", skillId: "s1", name: "Arduino", catalogued: true, type: "CONOCIMIENTO", minLevel: "INTERMEDIO", importance: "ALTA" },
    { id: "k2", skillId: null, name: "LoRaWAN", catalogued: false, type: "CONOCIMIENTO", minLevel: "BASICO", importance: "MEDIA" },
    { id: "k3", skillId: "s9", name: "Trabajo en equipo", catalogued: true, type: "HABILIDAD_BLANDA", minLevel: "AVANZADO", importance: "BAJA" },
  ],
};

export const MANUAL_PROFILE: RequiredProfile = {
  ...AI_PROFILE,
  id: "rp2",
  source: "MANUAL",
  name: "Diseñador de interfaces",
  justification: "",
  quantity: 1,
  priority: "MEDIA",
  minWeeklyHours: null,
  position: 1,
  skills: [AI_PROFILE.skills[0]],
};

export const ANALYSIS: ProjectAnalysis = {
  id: "a1",
  projectId: "p1",
  status: "COMPLETADO",
  provider: "fake",
  model: "fake-model",
  promptVersion: "v1",
  summary: "Propuesta de perfiles para el proyecto.",
  errorMessage: null,
  durationMs: 800,
  inputTokens: 100,
  outputTokens: 200,
  createdAt: "2026-10-16T15:00:00Z",
  completedAt: "2026-10-16T15:00:01Z",
  outdated: false,
  profiles: [AI_PROFILE, MANUAL_PROFILE],
};

const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };

/** Error de axios con respuesta del backend ({ statusCode, message }). */
export function httpError(status: number, message: string) {
  return new AxiosError(message, "ERR_BAD_RESPONSE", config, null, {
    status,
    statusText: "",
    data: { statusCode: status, message },
    headers: {},
    config,
  });
}

/** Timeout del navegador: sin respuesta. */
export function timeoutError() {
  return new AxiosError("timeout of 60000ms exceeded", "ECONNABORTED", config);
}

/** Sin red: tampoco hay respuesta, pero no es un timeout. */
export function offlineError() {
  return new AxiosError("Network Error", "ERR_NETWORK", config);
}
