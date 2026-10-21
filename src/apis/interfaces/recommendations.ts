// Recomendaciones de personas (RF15–RF17). Copia exacta de notes/backend-iteracion-2.md §12.
import type { PersonType } from "./auth";
import type { ProfilePriority, ProfileSource, SkillImportance } from "./analysis";
import type { AvailabilityStatus, SkillLevel } from "./collaborator";

/** Componentes del puntaje, cada uno de 0 a 1. */
export interface MatchComponents {
  skills: number;
  semantic: number;
  experience: number;
  availability: number;
}

/** Datos de la persona que puede ver el líder: nunca trae correo, teléfono ni enlaces. */
export interface RecommendedPerson {
  id: string;
  fullName: string;
  personType: PersonType;
  programName: string;
  researchGroup: string | null;
  availabilityStatus: AvailabilityStatus;
  weeklyHours: number;
  /** `false`: la persona existe sin cuenta (importada) y no se le puede escribir desde la plataforma. */
  hasUser: boolean;
}

export interface RecommendationItem {
  id: string;
  rank: number;
  /** 0–100. */
  score: number;
  components: MatchComponents;
  matchedSkillCount: number;
  requiredSkillCount: number;
  collaborator: RecommendedPerson;
}

export interface ProfileRecommendations {
  profileId: string;
  name: string;
  source: ProfileSource;
  quantity: number;
  priority: ProfilePriority;
  recommendations: RecommendationItem[];
}

export interface RecommendationsResponse {
  projectId: string;
  /** `null` si nunca se generaron. */
  generatedAt: string | null;
  includeUnavailable: boolean;
  profiles: ProfileRecommendations[];
}

export interface MatchBreakdown {
  matchedSkills: {
    skill: string;
    required: SkillLevel;
    has: SkillLevel;
    months: number;
    importance: SkillImportance;
    /** nivel × profundidad, de 0 a 1. */
    points: number;
  }[];
  missingSkills: { skill: string; required: SkillLevel; importance: SkillImportance }[];
  experience: { relevantMonths: number; items: string[] };
  availability: { status: AvailabilityStatus; weeklyHours: number; requiredHours: number | null };
  /** Coseno crudo; `null` si faltó algún embedding (entonces `weights.semantic` es 0). */
  semantic: { similarity: number | null };
  /** Pesos realmente aplicados (suman 1). */
  weights: MatchComponents;
}

/** Detalle de una recomendación (RF17): por qué se recomienda a la persona. */
export interface RecommendationDetail {
  id: string;
  rank: number;
  score: number;
  components: MatchComponents;
  breakdown: MatchBreakdown;
  generatedAt: string;
  profile: Pick<ProfileRecommendations, "name" | "source" | "quantity" | "priority"> & { id: string };
  collaborator: RecommendedPerson;
}

export interface GenerateRecommendationsPayload {
  includeUnavailable?: boolean;
}
