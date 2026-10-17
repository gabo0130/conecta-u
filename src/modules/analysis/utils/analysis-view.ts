import type { BadgeTone, SelectOption } from "@/components/atoms";
import type {
  AnalysisStatus,
  CreateRequiredProfilePayload,
  ProfilePriority,
  ProfileSource,
  RequiredProfile,
  RequiredProfileSkill,
  SkillImportance,
  UpdateRequiredProfilePayload,
} from "@/apis/interfaces/analysis";
import type { SkillType } from "@/apis/interfaces/catalogs";
import type { SkillLevel } from "@/apis/interfaces/collaborator";
import { validateInteger, type NumericRange } from "@/modules/collaborator/utils/collaborator-limits";
import { toOptions } from "@/utils/to-options";

// Etiquetas del análisis con IA (RF12–RF14). Las de nivel están en collaborator-view (LEVEL_LABEL).

export const PRIORITY_LABEL: Record<ProfilePriority, string> = { ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };
export const PRIORITY_TONE: Record<ProfilePriority, BadgeTone> = { ALTA: "red", MEDIA: "amber", BAJA: "gray" };
export const IMPORTANCE_LABEL: Record<SkillImportance, string> = {
  ALTA: "Importancia alta",
  MEDIA: "Importancia media",
  BAJA: "Importancia baja",
};
export const PROFILE_SOURCE_LABEL: Record<ProfileSource, string> = { IA: "IA", MANUAL: "Manual" };
export const ANALYSIS_STATUS_VIEW: Record<AnalysisStatus, { label: string; tone: BadgeTone }> = {
  PENDIENTE: { label: "En curso", tone: "amber" },
  COMPLETADO: { label: "Completado", tone: "green" },
  ERROR: { label: "Error", tone: "red" },
};

export const PRIORITY_OPTIONS = toOptions(PRIORITY_LABEL);
export const IMPORTANCE_OPTIONS: SelectOption<SkillImportance>[] = toOptions(PRIORITY_LABEL);

// Límites del backend (analysis-limits.ts, §12 del contrato).
export const PROFILE_NAME_MAX_LENGTH = 120;
export const PROFILE_TEXT_MAX_LENGTH = 2000;
export const PROFILE_QUANTITY: NumericRange = { min: 1, max: 10 };
export const PROFILE_WEEKLY_HOURS: NumericRange = { min: 1, max: 60 };
export const PROFILE_SKILLS: NumericRange = { min: 1, max: 8 };

/** Guardar un perfil se cortó por tiempo: puede que el backend sí lo haya guardado. */
export class ProfileTimeoutError extends Error {
  constructor() {
    super(
      "La IA está tardando en procesar el perfil y puede que ya se haya guardado. Revisa la lista antes de volver a intentarlo.",
    );
    this.name = "ProfileTimeoutError";
  }
}

export function formatQuantity(quantity: number) {
  return quantity === 1 ? "1 persona" : `${quantity} personas`;
}

/** Habilidad dentro del formulario de un perfil: del catálogo o una "no catalogada" que trajo la IA. */
export type ProfileSkillRow = {
  skillId: string | null;
  name: string;
  type: SkillType;
  minLevel: SkillLevel;
  importance: SkillImportance;
};

export type RequiredProfileForm = {
  name: string;
  description: string;
  justification: string;
  quantity: string;
  priority: ProfilePriority;
  minWeeklyHours: string;
  skills: ProfileSkillRow[];
  /** La lista de habilidades cambió: solo entonces se envía (y reemplaza la guardada). */
  skillsChanged: boolean;
};

export function toProfileForm(profile?: RequiredProfile): RequiredProfileForm {
  return {
    name: profile?.name ?? "",
    description: profile?.description ?? "",
    justification: profile?.justification ?? "",
    quantity: String(profile?.quantity ?? 1),
    priority: profile?.priority ?? "MEDIA",
    minWeeklyHours: profile?.minWeeklyHours?.toString() ?? "",
    skills: (profile?.skills ?? []).map(toSkillRow),
    skillsChanged: false,
  };
}

function toSkillRow(skill: RequiredProfileSkill): ProfileSkillRow {
  return {
    skillId: skill.catalogued ? skill.skillId : null,
    name: skill.name,
    type: skill.type,
    minLevel: skill.minLevel,
    importance: skill.importance,
  };
}

/** Mensaje del primer error del formulario o null. Mismos límites que el backend. */
export function validateProfileForm(form: RequiredProfileForm): string | null {
  const name = form.name.trim();
  if (!name) return "El nombre del perfil es obligatorio.";
  if (name.length > PROFILE_NAME_MAX_LENGTH) return `El nombre admite máximo ${PROFILE_NAME_MAX_LENGTH} caracteres.`;
  if (form.description.trim().length > PROFILE_TEXT_MAX_LENGTH || form.justification.trim().length > PROFILE_TEXT_MAX_LENGTH) {
    return `La descripción y la justificación admiten máximo ${PROFILE_TEXT_MAX_LENGTH} caracteres.`;
  }
  const quantityError = validateInteger(form.quantity, PROFILE_QUANTITY, { label: "La cantidad de personas" });
  if (quantityError) return quantityError;
  const hoursError = validateInteger(form.minWeeklyHours, PROFILE_WEEKLY_HOURS, {
    label: "Las horas mínimas por semana",
    required: false,
  });
  if (hoursError) return hoursError;
  if (form.skillsChanged) {
    const catalogued = form.skills.filter((skill) => skill.skillId);
    if (catalogued.length < PROFILE_SKILLS.min) return "Agrega al menos una habilidad del catálogo.";
    if (catalogued.length > PROFILE_SKILLS.max) return `Un perfil admite máximo ${PROFILE_SKILLS.max} habilidades.`;
  }
  return null;
}

function cataloguedSkills(form: RequiredProfileForm) {
  return form.skills.flatMap((skill) =>
    skill.skillId ? [{ skillId: skill.skillId, minLevel: skill.minLevel, importance: skill.importance }] : [],
  );
}

export function toCreatePayload(form: RequiredProfileForm): CreateRequiredProfilePayload {
  const description = form.description.trim();
  const justification = form.justification.trim();
  return {
    name: form.name.trim(),
    ...(description ? { description } : {}),
    ...(justification ? { justification } : {}),
    quantity: Number(form.quantity),
    priority: form.priority,
    ...(form.minWeeklyHours.trim() ? { minWeeklyHours: Number(form.minWeeklyHours) } : {}),
    skills: cataloguedSkills(form),
  };
}

/**
 * Solo los campos que cambiaron respecto de `initial`: cambiar nombre, descripción o habilidades
 * hace que el backend recalcule el embedding con Gemini, así que no se envían si no se tocaron.
 * Las habilidades solo van si la lista cambió (así se conservan las "no catalogadas" de la IA).
 */
export function toUpdatePayload(form: RequiredProfileForm, initial: RequiredProfileForm): UpdateRequiredProfilePayload {
  const payload: UpdateRequiredProfilePayload = {};
  const text = (value: string) => value.trim();
  const hours = (value: string) => (value.trim() ? Number(value) : null);

  if (text(form.name) !== text(initial.name)) payload.name = text(form.name);
  if (text(form.description) !== text(initial.description)) payload.description = text(form.description) || null;
  if (text(form.justification) !== text(initial.justification)) {
    payload.justification = text(form.justification) || null;
  }
  if (Number(form.quantity) !== Number(initial.quantity)) payload.quantity = Number(form.quantity);
  if (form.priority !== initial.priority) payload.priority = form.priority;
  if (hours(form.minWeeklyHours) !== hours(initial.minWeeklyHours)) payload.minWeeklyHours = hours(form.minWeeklyHours);
  if (form.skillsChanged) payload.skills = cataloguedSkills(form);
  return payload;
}
