import type {
  RecommendationDetail,
  RecommendationItem,
  RecommendationsResponse,
} from "@/apis/interfaces/recommendations";

// Datos de prueba ficticios con la forma exacta del contrato (§12).

export const RECOMMENDATION: RecommendationItem = {
  id: "r1",
  rank: 1,
  score: 72.4,
  components: { skills: 0.8, semantic: 0.6, experience: 0.5, availability: 1 },
  matchedSkillCount: 2,
  requiredSkillCount: 3,
  collaborator: {
    id: "c1",
    fullName: "Ana Prueba",
    personType: "ESTUDIANTE",
    programName: "Ingeniería de Sistemas",
    researchGroup: "Semillero de prueba",
    availabilityStatus: "DISPONIBLE",
    weeklyHours: 10,
    hasUser: true,
  },
};

export const IMPORTED_RECOMMENDATION: RecommendationItem = {
  ...RECOMMENDATION,
  id: "r2",
  rank: 2,
  score: 35,
  collaborator: {
    ...RECOMMENDATION.collaborator,
    id: "c2",
    fullName: "Beto Ficticio",
    researchGroup: null,
    availabilityStatus: "PARCIAL",
    hasUser: false,
  },
};

export const RECOMMENDATIONS: RecommendationsResponse = {
  projectId: "p1",
  generatedAt: "2026-10-16T15:00:00Z",
  includeUnavailable: false,
  profiles: [
    {
      profileId: "rp1",
      name: "Desarrollador de Hardware e IoT",
      source: "IA",
      quantity: 2,
      priority: "ALTA",
      recommendations: [RECOMMENDATION, IMPORTED_RECOMMENDATION],
    },
    { profileId: "rp2", name: "Diseñador de interfaces", source: "MANUAL", quantity: 1, priority: "MEDIA", recommendations: [] },
  ],
};

export const NEVER_GENERATED: RecommendationsResponse = {
  ...RECOMMENDATIONS,
  generatedAt: null,
  profiles: RECOMMENDATIONS.profiles.map((profile) => ({ ...profile, recommendations: [] })),
};

export const DETAIL: RecommendationDetail = {
  id: "r1",
  rank: 1,
  score: 72.4,
  components: RECOMMENDATION.components,
  breakdown: {
    matchedSkills: [
      { skill: "Arduino", required: "INTERMEDIO", has: "AVANZADO", months: 20, importance: "ALTA", points: 0.95 },
    ],
    missingSkills: [{ skill: "Python", required: "INTERMEDIO", importance: "MEDIA" }],
    experience: { relevantMonths: 12, items: ["Monitor – Semillero de prueba (12 meses)"] },
    availability: { status: "DISPONIBLE", weeklyHours: 10, requiredHours: 8 },
    semantic: { similarity: 0.68 },
    weights: { skills: 0.5, semantic: 0.2, experience: 0.15, availability: 0.15 },
  },
  generatedAt: "2026-10-16T15:00:00Z",
  profile: { id: "rp1", name: "Desarrollador de Hardware e IoT", source: "IA", quantity: 2, priority: "ALTA" },
  collaborator: RECOMMENDATION.collaborator,
};
