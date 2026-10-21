import type { PersonType, RegisterCollaboratorPayload, UserRole } from "./auth";
import type {
  AvailabilityStatus,
  Collaborator,
  CollaboratorSource,
  DocumentType,
  Identification,
  SkillLevel,
} from "./collaborator";
import type { SkillType } from "./catalogs";
import type { PageMeta } from "./pagination";
import type { Project, ProjectStatus } from "./projects";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  meta: PageMeta;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  /** v2.1: toda cuenta queda vinculada a una persona identificada. */
  collaborator: RegisterCollaboratorPayload;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
}

/* ---- Consulta global del ADMIN (/admin/*) ---- */

/** Líder de un proyecto; `collaboratorId` es su perfil técnico si lo tiene. */
export interface AdminProjectLeader {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  collaboratorId: string | null;
}

export interface AdminProject extends Project {
  leader: AdminProjectLeader | null;
}

export interface AdminProjectsResponse {
  projects: AdminProject[];
  meta: PageMeta;
}

/** Cuenta vinculada a un perfil técnico (null: persona sin usuario, p. ej. importada). */
export interface AdminLinkedUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface AdminCollaboratorSkill {
  name: string;
  type: SkillType;
  level: SkillLevel;
}

export interface AdminCollaboratorSummary extends Identification {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  personType: PersonType;
  programId: string;
  availabilityStatus: AvailabilityStatus;
  weeklyHours: number;
  source: CollaboratorSource;
  active: boolean;
  dataConsent: boolean;
  skillsCount: number;
  /** A7 (v2.1): cuáles habilidades, no solo cuántas. */
  skills: AdminCollaboratorSkill[];
  experiencesCount: number;
  user: AdminLinkedUser | null;
}

/** ADMIN corrige identificación y contacto, incluido el documento (v2.1). */
export interface UpdateIdentificationPayload {
  documentType?: DocumentType;
  documentNumber?: string;
  phone?: string;
  nationality?: string;
  alternateEmail?: string | null;
  institutionalCode?: string | null;
}

export interface AdminCollaboratorsResponse {
  collaborators: AdminCollaboratorSummary[];
  meta: PageMeta;
}

export interface AdminCollaboratorDetail extends Collaborator {
  active: boolean;
  dataConsentAt: string | null;
  user: AdminLinkedUser | null;
  ledProjects: { id: string; title: string; status: ProjectStatus }[];
}

/* ---- Importación de colaboradores desde Excel (RF23–RF24) ---- */

export interface ImportRejectedRow {
  sheet: string;
  row: number;
  email: string;
  reason: string;
}

export interface ImportCollaboratorsResult {
  id: string;
  created: number;
  rejected: ImportRejectedRow[];
  warnings: string[];
}

/* ---- Historial de importaciones (auditoría de cada carga) ---- */

export interface ImportRunSummary {
  id: string;
  fileName: string;
  createdAt: string;
  importedBy: AdminLinkedUser | null;
  created: number;
  rejectedCount: number;
}

export interface ImportRunsResponse {
  runs: ImportRunSummary[];
  meta: PageMeta;
}

export interface ImportRunDetail {
  id: string;
  fileName: string;
  createdAt: string;
  importedBy: AdminLinkedUser | null;
  created: number;
  rejected: ImportRejectedRow[];
  warnings: string[];
}
