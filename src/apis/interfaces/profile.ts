export type AvailabilityStatus = "DISPONIBLE" | "PARCIAL" | "NO_DISPONIBLE";
export type SkillType = "CONOCIMIENTO" | "COMPETENCIA";

export interface ProfileSkill {
  id: string;
  name: string;
  type: SkillType;
  level: string | null;
}

export interface ProfileExperience {
  id: string;
  title: string;
  organization: string | null;
  period: string | null;
  description: string | null;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  program: string | null;
  headline: string | null;
  studyGroup: string | null;
  availabilityStatus: AvailabilityStatus;
  weeklyHours: string | null;
  modality: string | null;
  skills: ProfileSkill[];
  experiences: ProfileExperience[];
}

export interface UpdateProfilePayload {
  headline?: string;
  studyGroup?: string;
}

export interface AvailabilityPayload {
  availabilityStatus?: AvailabilityStatus;
  weeklyHours?: string;
  modality?: string;
}

export interface SkillPayload {
  name: string;
  type: SkillType;
  level?: string;
}

export interface ExperiencePayload {
  title: string;
  organization?: string;
  period?: string;
  description?: string;
}
