import type { BadgeTone } from "@/components/atoms";
import type { PersonType, UserRole } from "@/apis/interfaces/auth";
import type {
  AvailabilityStatus,
  CollaboratorSource,
  Experience,
  ExperienceType,
  SkillLevel,
} from "@/apis/interfaces/collaborator";

// Etiquetas en español de los enums del perfil técnico: las usan "Mi perfil" y las vistas del ADMIN.

export const AVAILABILITY_VIEW: Record<AvailabilityStatus, { label: string; tone: BadgeTone }> = {
  DISPONIBLE: { label: "Disponible", tone: "green" },
  PARCIAL: { label: "Parcial", tone: "amber" },
  NO_DISPONIBLE: { label: "No disponible", tone: "gray" },
};

export const PERSON_TYPE_LABEL: Record<PersonType, string> = {
  ESTUDIANTE: "Estudiante",
  DOCENTE: "Docente",
};

export const SOURCE_LABEL: Record<CollaboratorSource, string> = {
  REGISTRO: "Registro propio",
  ADMIN: "Creado por el administrador",
  IMPORTACION: "Importado desde Excel",
};

export const LEVEL_LABEL: Record<SkillLevel, string> = {
  BASICO: "Básico",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
  EXPERTO: "Experto",
};

export const EXPERIENCE_TYPE_LABEL: Record<ExperienceType, string> = {
  LABORAL: "Laboral",
  PRACTICA: "Práctica",
  PROYECTO_ACADEMICO: "Proyecto académico",
  SEMILLERO_INVESTIGACION: "Semillero de investigación",
  PROYECTO_PERSONAL: "Proyecto personal",
  VOLUNTARIADO: "Voluntariado",
  DOCENCIA: "Docencia",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  LIDER: "Líder de proyecto",
  COLABORADOR: "Colaborador",
  ADMIN: "Administrador",
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatMonthYear(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", { month: "short", year: "numeric" });
}

export function getExperienceMeta(experience: Experience) {
  const period = `${formatMonthYear(experience.startDate)} – ${experience.current ? "actual" : formatMonthYear(experience.endDate)}`;
  return [experience.organization, period, `${experience.durationMonths} meses`].filter(Boolean).join(" · ");
}
