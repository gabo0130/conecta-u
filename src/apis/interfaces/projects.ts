import type { Skill } from "./catalogs";
import type { PageMeta } from "./pagination";

export type ProjectStatus = "BORRADOR" | "EN_ANALISIS" | "ANALIZADO";

export interface Deliverable {
  id?: string;
  name: string;
  scope: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  objectives: string;
  /** v2.2, E5: null en proyectos anteriores a v2.2. */
  executingEntity: string | null;
  sponsorEntity: string | null;
  durationMonths: number | null;
  typeId: string;
  categoryId: string;
  programId: string | null;
  typeData: Record<string, unknown> | null;
  knownSkills: Skill[] | null;
  deliverables: Deliverable[];
  leaderId: string;
  /** Quién lo registró (v2.1, A5): el líder o el ADMIN a su nombre; null en los anteriores. */
  createdById?: string | null;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectPayload {
  title: string;
  summary: string;
  objectives: string;
  /** v2.2, E5: ejecutora y duración obligatorias al crear; la patrocinadora es opcional. */
  executingEntity?: string;
  sponsorEntity?: string | null;
  durationMonths?: number;
  typeId: string;
  categoryId: string;
  programId?: string | null;
  typeData?: Record<string, unknown>;
  knownSkillIds?: string[];
  deliverables: Deliverable[];
  /** Solo el ADMIN (v2.1, A5): líder a cuyo nombre registra el proyecto. */
  leaderId?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  meta: PageMeta;
}
