import type { PersonType } from "./auth";
import type { Skill } from "./catalogs";

export type AvailabilityStatus = "DISPONIBLE" | "PARCIAL" | "NO_DISPONIBLE";
export type CollaboratorSource = "REGISTRO" | "ADMIN" | "IMPORTACION";
export type SkillLevel = "BASICO" | "INTERMEDIO" | "AVANZADO" | "EXPERTO";
export type ExperienceType =
  | "LABORAL"
  | "PRACTICA"
  | "PROYECTO_ACADEMICO"
  | "SEMILLERO_INVESTIGACION"
  | "PROYECTO_PERSONAL"
  | "VOLUNTARIADO"
  | "DOCENCIA";

export interface CollaboratorSkill {
  id: string;
  skill: Skill;
  level: SkillLevel;
  experienceMonths: number;
  lastUsedYear: number | null;
}

export interface ExperienceTechnology {
  id: string;
  name: string;
}

export interface Experience {
  id: string;
  type: ExperienceType;
  role: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  weeklyHours: number;
  level: SkillLevel;
  description: string | null;
  technologies: ExperienceTechnology[];
  durationMonths: number;
}

export interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  personType: PersonType;
  programId: string;
  semester: number | null;
  researchGroup: string | null;
  summary: string | null;
  profileUrl: string | null;
  dataConsent: boolean;
  source: CollaboratorSource;
  availabilityStatus: AvailabilityStatus;
  weeklyHours: number;
  skills: CollaboratorSkill[];
  experiences: Experience[];
}

export interface CreateCollaboratorPayload {
  firstName: string;
  lastName: string;
  personType: PersonType;
  programId: string;
  dataConsent?: boolean;
}

export interface UpdateCollaboratorPayload {
  firstName?: string;
  lastName?: string;
  programId?: string;
  /** null borra el valor guardado (el backend lo acepta en los campos opcionales). */
  semester?: number | null;
  researchGroup?: string | null;
  summary?: string | null;
  profileUrl?: string | null;
  dataConsent?: boolean;
}

export interface AvailabilityPayload {
  availabilityStatus: AvailabilityStatus;
  weeklyHours: number;
}

export interface CollaboratorSkillPayload {
  skillId: string;
  level: SkillLevel;
  experienceMonths: number;
  lastUsedYear?: number;
}

export interface ExperiencePayload {
  type: ExperienceType;
  role: string;
  organization: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  weeklyHours: number;
  level: SkillLevel;
  skillIds?: string[];
  description?: string;
}
