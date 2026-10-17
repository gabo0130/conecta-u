// Análisis de proyectos con IA (RF12–RF14). Copia exacta de notes/backend-iteracion-2.md §12.
import type { SkillType } from "./catalogs";
import type { SkillLevel } from "./collaborator";
import type { PageMeta } from "./pagination";

export type AnalysisStatus = "PENDIENTE" | "COMPLETADO" | "ERROR";
export type ProfileSource = "IA" | "MANUAL";
export type ProfilePriority = "ALTA" | "MEDIA" | "BAJA";
export type SkillImportance = "ALTA" | "MEDIA" | "BAJA";

export interface RequiredProfileSkill {
  id: string;
  /** `null` cuando la IA propuso una habilidad que no está en el catálogo (`catalogued: false`). */
  skillId: string | null;
  name: string;
  catalogued: boolean;
  type: SkillType;
  minLevel: SkillLevel;
  importance: SkillImportance;
}

export interface RequiredProfile {
  id: string;
  source: ProfileSource;
  name: string;
  description: string;
  /** Por qué el proyecto necesita el perfil (RF14). En los MANUAL puede ser "". */
  justification: string;
  quantity: number;
  priority: ProfilePriority;
  minWeeklyHours: number | null;
  position: number;
  active: boolean;
  skills: RequiredProfileSkill[];
}

/** Un intento de análisis (historial). No trae perfiles. */
export interface AnalysisSummary {
  id: string;
  projectId: string;
  status: AnalysisStatus;
  provider: string;
  model: string;
  promptVersion: string;
  summary: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string;
  completedAt: string | null;
}

/** Último análisis COMPLETADO con los perfiles activos (de la IA y manuales). */
export interface ProjectAnalysis extends AnalysisSummary {
  /** El proyecto cambió después del análisis: se ofrece volver a analizar. */
  outdated: boolean;
  profiles: RequiredProfile[];
}

export interface AnalysisHistoryResponse {
  analyses: AnalysisSummary[];
  meta: PageMeta;
}

export interface RequiredProfileSkillPayload {
  skillId: string;
  minLevel: SkillLevel;
  importance: SkillImportance;
}

export interface CreateRequiredProfilePayload {
  name: string;
  description?: string;
  justification?: string;
  quantity: number;
  priority: ProfilePriority;
  minWeeklyHours?: number;
  skills: RequiredProfileSkillPayload[];
}

/** Todo opcional; `skills` reemplaza la lista completa y `active: false` descarta el perfil. */
export interface UpdateRequiredProfilePayload {
  name?: string;
  description?: string | null;
  justification?: string | null;
  quantity?: number;
  priority?: ProfilePriority;
  minWeeklyHours?: number | null;
  skills?: RequiredProfileSkillPayload[];
  active?: boolean;
}
