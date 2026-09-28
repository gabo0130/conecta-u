// Rangos del perfil técnico: copia de `collaborator-limits.ts` del backend (mismos valores que valida la API).

export type NumericRange = { min: number; max: number };

export const COLLABORATOR_WEEKLY_HOURS: NumericRange = { min: 0, max: 60 };
export const EXPERIENCE_WEEKLY_HOURS: NumericRange = { min: 1, max: 60 };
export const SKILL_EXPERIENCE_MONTHS: NumericRange = { min: 0, max: 600 };
export const SEMESTER: NumericRange = { min: 1, max: 12 };
export const MIN_LAST_USED_YEAR = 1970;

type IntegerFieldOptions = { label: string; required?: boolean };

/**
 * Valida el texto de un campo numérico entero. Devuelve el mensaje de error o null.
 * Un campo vacío no se convierte en 0: si es obligatorio se avisa, si es opcional es válido.
 */
export function validateInteger(value: string, range: NumericRange, { label, required = true }: IntegerFieldOptions) {
  const text = value.trim();
  // El label trae su artículo ("La dedicación semanal"): "Falta la dedicación semanal." concuerda siempre.
  if (!text) return required ? `Falta ${label.charAt(0).toLowerCase()}${label.slice(1)}.` : null;
  const number = Number(text);
  if (!Number.isInteger(number) || number < range.min || number > range.max) {
    return `${label} debe ser un número entero entre ${range.min} y ${range.max}.`;
  }
  return null;
}

/** Texto opcional de un número: vacío → null (así se puede borrar un valor guardado). */
export function optionalInteger(value: string) {
  return value.trim() ? Number(value) : null;
}

/** Fechas de una experiencia: fin obligatoria si no está activa y nunca anterior al inicio. */
export function validateExperienceDates(startDate: string, endDate: string, current: boolean) {
  if (!startDate) return "La fecha de inicio es obligatoria.";
  if (current) return null;
  if (!endDate) return "Indica la fecha de fin o marca «Actualmente activo».";
  // Las fechas "AAAA-MM-DD" se comparan bien como texto.
  if (endDate < startDate) return "La fecha de fin no puede ser anterior a la de inicio.";
  return null;
}

export const PROFILE_URL_MAX_LENGTH = 300;

/** Enlace del perfil: vacío es válido; si llega, http(s), con dominio y ≤ 300 caracteres (mismas reglas que el backend). */
export function validateProfileUrl(value: string) {
  const text = value.trim();
  if (!text) return null;
  const message = `El enlace debe empezar por http:// o https:// y tener máximo ${PROFILE_URL_MAX_LENGTH} caracteres.`;
  if (text.length > PROFILE_URL_MAX_LENGTH) return message;
  try {
    const url = new URL(text);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".") ? null : message;
  } catch {
    return message;
  }
}
