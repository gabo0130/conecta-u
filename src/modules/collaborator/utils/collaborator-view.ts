import type { BadgeTone, SelectOption } from "@/components/atoms";
import type { PersonType, RegisterRole, UserRole } from "@/apis/interfaces/auth";
import type {
  AvailabilityStatus,
  CollaboratorSource,
  Experience,
  ExperienceType,
  SkillLevel,
} from "@/apis/interfaces/collaborator";
import { formatDate } from "@/utils/dates";
import { toOptions } from "@/utils/to-options";

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
  return formatDate(iso, { month: "short", year: "numeric" });
}

export function getExperienceMeta(experience: Experience) {
  const period = `${formatMonthYear(experience.startDate)} – ${experience.current ? "actual" : formatMonthYear(experience.endDate)}`;
  return [experience.organization, period, `${experience.durationMonths} meses`].filter(Boolean).join(" · ");
}

/* ---- Opciones de selects: se derivan de los mapas de arriba para no repetir las etiquetas ---- */

export const PERSON_TYPE_OPTIONS = toOptions(PERSON_TYPE_LABEL);
export const LEVEL_OPTIONS = toOptions(LEVEL_LABEL);
export const EXPERIENCE_TYPE_OPTIONS = toOptions(EXPERIENCE_TYPE_LABEL);
export const ROLE_OPTIONS = toOptions(ROLE_LABEL);
/** El registro público solo permite estos roles (el backend rechaza ADMIN). */
export const REGISTERABLE_ROLE_OPTIONS = ROLE_OPTIONS.filter(
  (option): option is SelectOption<RegisterRole> => option.value !== "ADMIN",
);
export const AVAILABILITY_OPTIONS = toOptions(AVAILABILITY_VIEW, (view) => view.label);

export const DATA_CONSENT_LABEL =
  "Autorizo el tratamiento de mis datos personales para las recomendaciones y convocatorias de Conecta U (Ley 1581 de 2012).";
