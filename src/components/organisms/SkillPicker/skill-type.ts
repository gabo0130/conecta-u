import type { SkillType } from "@/apis/interfaces/catalogs";
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

export const SKILL_TYPE_OPTIONS: { value: SkillType; label: string }[] = Object.entries(
  SKILL_TYPE_LABEL,
).map(([value, label]) => ({ value: value as SkillType, label }));
