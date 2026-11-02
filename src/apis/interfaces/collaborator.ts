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
  /** v2.2, E8 (RF4): certificado que soporta la experiencia (solo metadatos). */
  certificate: ExperienceCertificate | null;
  /** La experiencia laboral, de práctica y de docencia debe tener certificado. */
  certificateRequired: boolean;
}

export type CertificateMimeType = "application/pdf" | "image/png" | "image/jpeg";

export interface ExperienceCertificate {
  fileName: string;
  mimeType: CertificateMimeType;
  sizeBytes: number;
  uploadedAt: string;
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
  /** Tesis (D5): hasta 10 temas de interés; entran en el texto del embedding. */
  interests: string[];
  profileUrl: string | null;
  dataConsent: boolean;
  /** Declaración de veracidad (v2.2, E2): solo la ven la propia persona y el ADMIN. */
  truthfulnessDeclared: boolean;
  truthfulnessDeclaredAt: string | null;
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
  /** v2.2, E2: obligatoria al crear el perfil. */
  truthfulnessDeclared: true;
}

export interface UpdateCollaboratorPayload {
  firstName?: string;
  lastName?: string;
  programId?: string;
  /** null borra el valor guardado (el backend lo acepta en los campos opcionales). */
  semester?: number | null;
  researchGroup?: string | null;
  summary?: string | null;
  /** [] borra los intereses. */
  interests?: string[];
  profileUrl?: string | null;
  dataConsent?: boolean;
  /** v2.2, E2: el backend la exige en cada cambio de «Mi perfil»; los modales la piden con su casilla. */
  truthfulnessDeclared?: true;
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
