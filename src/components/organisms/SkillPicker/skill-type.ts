import type { SkillCategory, SkillStatus, SkillType } from "@/apis/interfaces/catalogs";
import { toOptions } from "@/utils/to-options";
import type { BadgeTone, ChipTone } from "../../atoms";

/** Clasificación v2.2 (E6): solo cambian las etiquetas; los valores del enum son los mismos. */
export const SKILL_TYPE_LABEL: Record<SkillType, string> = {
  CONOCIMIENTO: "Conocimiento técnico",
  COMPETENCIA: "Competencia técnica",
  HABILIDAD_BLANDA: "Competencia blanda",
};

/** Qué es cada tipo, con ejemplos (guía de importación y ayudas). */
export const SKILL_TYPE_HINT: Record<SkillType, string> = {
  CONOCIMIENTO: "herramientas y tecnologías que sabes usar (Python, AutoCAD, SPSS)",
  COMPETENCIA: "el rol o la disciplina que ejerces (investigador, desarrollador, analista)",
  HABILIDAD_BLANDA: "cómo trabajas con otros (liderazgo, comunicación, trabajo en equipo)",
};

/** Orden en que se muestran los tres tipos (perfil, guía de importación). */
export const SKILL_TYPE_ORDER: SkillType[] = ["CONOCIMIENTO", "COMPETENCIA", "HABILIDAD_BLANDA"];

/** Título de cada grupo en plural ("Conocimientos técnicos"). */
export const SKILL_TYPE_GROUP_LABEL: Record<SkillType, string> = {
  CONOCIMIENTO: "Conocimientos técnicos",
  COMPETENCIA: "Competencias técnicas",
  HABILIDAD_BLANDA: "Competencias blandas",
};

export const SKILL_TYPE_TONE: Record<SkillType, ChipTone> = {
  CONOCIMIENTO: "blue",
  COMPETENCIA: "red",
  HABILIDAD_BLANDA: "green",
};

export const SKILL_TYPE_OPTIONS = toOptions(SKILL_TYPE_LABEL);

/** Separa lo técnico (conocimientos y competencias técnicas) de las competencias blandas. */
export function groupBySoftSkill<T>(items: T[], getType: (item: T) => SkillType) {
  return {
    technical: items.filter((item) => getType(item) !== "HABILIDAD_BLANDA"),
    soft: items.filter((item) => getType(item) === "HABILIDAD_BLANDA"),
  };
}

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

export const SKILL_CATEGORY_OPTIONS = toOptions(SKILL_CATEGORY_LABEL);

export const SKILL_STATUS_LABEL: Record<SkillStatus, string> = {
  ACTIVA: "Activa",
  PENDIENTE: "Pendiente de revisión",
};

export const SKILL_STATUS_TONE: Record<SkillStatus, BadgeTone> = {
  ACTIVA: "green",
  PENDIENTE: "amber",
};

export const SKILL_STATUS_OPTIONS = toOptions(SKILL_STATUS_LABEL);
