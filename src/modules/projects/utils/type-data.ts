import type { TemplateField } from "@/apis/interfaces/catalogs";

function isEmpty(value: unknown) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && Number.isNaN(value));
}

/**
 * Deja en `typeData` solo los campos de la plantilla del tipo y descarta los vacíos.
 * Al cambiar de tipo, los campos del tipo anterior desaparecen (el backend rechaza claves
 * desconocidas con 400) y se conservan los que ambos tipos comparten.
 */
export function pickTemplateData(fields: TemplateField[], typeData: Record<string, unknown>) {
  const keys = new Set(fields.map((field) => field.key));
  return Object.fromEntries(
    Object.entries(typeData)
      .filter(([key, value]) => keys.has(key) && !isEmpty(value))
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  );
}

/** Campos obligatorios de la plantilla que no tienen valor. */
export function missingRequiredFields(fields: TemplateField[], typeData: Record<string, unknown>) {
  return fields.filter((field) => field.required && isEmpty(typeData[field.key]));
}
