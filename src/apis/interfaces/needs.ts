import type { Skill } from "./catalogs";
import type { PageMeta } from "./pagination";
import type { Deliverable } from "./projects";

// Tesis (PGCS01): necesidades institucionales. Contrato en conecta-u-back, `NeedsController`.

export type NeedKind =
  | "ACADEMICA"
  | "ADMINISTRATIVA"
  | "INVESTIGATIVA"
  | "TECNOLOGICA"
  | "BIENESTAR"
  | "INFRAESTRUCTURA"
  | "INNOVACION";

export type NeedStatus = "REGISTRADA" | "CARACTERIZADA" | "CONVERTIDA" | "DESCARTADA";

export type PriorityLevel = "ALTA" | "MEDIA" | "BAJA";

export type NeedSort = "recent" | "priority";

export type NeedElement =
  | "problem"
  | "objective"
  | "beneficiaries"
  | "expectedResults"
  | "competencies"
  | "deadline"
  | "dependency";

export interface NeedSummary {
  id: string;
  title: string;
  kind: NeedKind;
  status: NeedStatus;
  urgency: number;
  impact: number;
  deadline: string | null;
  dependency: string | null;
  completeness: number;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  projectId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface NeedCharacterization {
  problem: string;
  objective: string;
  beneficiaries: string;
  expectedResults: string[];
  competencies: { skillId: string; name: string }[];
  unmatchedCompetencies: string[];
  suggestedProjectTypeCode: string | null;
  missingInformation: string[];
  provider: string;
  model: string;
  promptVersion: string;
}

export interface Need extends NeedSummary {
  description: string;
  characterization: NeedCharacterization | null;
  characterizedAt: string | null;
  discardReason: string | null;
  missingElements: { element: NeedElement; label: string; weight: number }[];
}

export interface NeedListResponse {
  needs: NeedSummary[];
  meta: PageMeta;
}

export interface NeedPayload {
  title: string;
  description: string;
  kind: NeedKind;
  urgency: number;
  impact: number;
  deadline?: string | null;
  dependency?: string | null;
}

/** Borrador del proyecto que arma el backend desde la caracterización (`GET /needs/:id/opportunity-draft`). */
export interface OpportunityDraft {
  needId: string;
  title: string;
  summary: string;
  objectives: string;
  executingEntity: string | null;
  durationMonths: number | null;
  typeId: string | null;
  knownSkills: Skill[];
  deliverables: Deliverable[];
}
