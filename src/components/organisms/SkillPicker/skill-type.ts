import type { SkillCategory, SkillType } from "@/apis/interfaces/catalogs";
import { toOptions } from "@/utils/to-options";
import type { ChipTone } from "../../atoms";

export const SKILL_TYPE_LABEL: Record<SkillType, string> = {
  CONOCIMIENTO: "Conocimiento",
  COMPETENCIA: "Competencia",
  HABILIDAD_BLANDA: "Habilidad blanda",
};

export const SKILL_TYPE_TONE: Record<SkillType, ChipTone> = {
  CONOCIMIENTO: "blue",
  COMPETENCIA: "red",
  HABILIDAD_BLANDA: "green",
};

export const SKILL_TYPE_OPTIONS = toOptions(SKILL_TYPE_LABEL);

/** Categorías del catálogo de habilidades en español (el backend envía el enum, p. ej. "BASE_DATOS"). */
export const SKILL_CATEGORY_LABEL: Record<SkillCategory, string> = {
  LENGUAJE: "Lenguaje",
  FRAMEWORK: "Framework",
  BASE_DATOS: "Base de datos",
  NUBE_DEVOPS: "Nube y DevOps",
  DATOS_IA: "Datos e IA",
  DISENO_UX: "Diseño y UX",
  HERRAMIENTA: "Herramienta",
  METODOLOGIA: "Metodología",
  GESTION: "Gestión",
  COMUNICACION: "Comunicación",
  TRABAJO_EQUIPO: "Trabajo en equipo",
  LIDERAZGO: "Liderazgo",
  OTRA: "Otra",
};
