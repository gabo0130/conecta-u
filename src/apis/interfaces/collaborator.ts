import type { PersonType } from "./auth";
import type { Skill } from "./catalogs";

/** v2.1 (A1): CC cédula, TI tarjeta de identidad, CE cédula de extranjería, PPT permiso por protección temporal, PA pasaporte. */
export type DocumentType = "CC" | "TI" | "CE" | "PPT" | "PA";

/** Identificación y contacto que se envían al crear una persona (v2.1, A1–A4). */
export interface IdentificationPayload {
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  nationality: string;
  alternateEmail?: string | null;
  institutionalCode?: string | null;
}

/** Identificación tal como la devuelve el backend (solo a la propia persona y al ADMIN). */
export interface Identification {
  documentType: DocumentType | null;
  documentNumber: string | null;
  phone: string | null;
  nationality: string | null;
  alternateEmail: string | null;
  institutionalCode: string | null;
  /** Faltan documento, teléfono o nacionalidad (personas anteriores a v2.1). */
  identificationComplete: boolean;
}

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

export interface Collaborator extends Identification {
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

export interface CreateCollaboratorPayload extends IdentificationPayload {
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
  /** El documento solo se puede registrar si aún no lo tiene; cambiarlo es del ADMIN. */
  documentType?: DocumentType;
  documentNumber?: string;
  phone?: string;
  nationality?: string;
  alternateEmail?: string | null;
  institutionalCode?: string | null;
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
