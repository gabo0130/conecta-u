import type { PersonType, UserRole } from "./auth";
import type { AvailabilityStatus, Collaborator, CollaboratorSource } from "./collaborator";
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

export interface AdminCollaboratorSummary {
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
  experiencesCount: number;
  user: AdminLinkedUser | null;
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
  created: number;
  rejected: ImportRejectedRow[];
  warnings: string[];
}
