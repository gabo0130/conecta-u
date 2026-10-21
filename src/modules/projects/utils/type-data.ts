import type { TemplateField } from "@/apis/interfaces/catalogs";

function isEmpty(value: unknown) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && Number.isNaN(value)) || (Array.isArray(value) && value.length === 0);
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

/** Palabras clave de un campo `tags` (v2.1, A6): siempre una lista de textos. */
export function tagsOf(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** Rango pedido por un campo `tags` en texto: "entre 3 y 5", "al menos 1". */
export function tagsRangeText(field: TemplateField) {
  const min = field.minItems ?? 1;
  return field.maxItems ? `entre ${min} y ${field.maxItems}` : `al menos ${min}`;
}

/** Primer campo de palabras clave fuera de su rango, con el mismo mensaje que el backend; o null. */
export function tagsCountError(fields: TemplateField[], typeData: Record<string, unknown>): string | null {
  for (const field of fields) {
    if (field.kind !== "tags") continue;
    const tags = tagsOf(typeData[field.key]);
    if (tags.length === 0 && !field.required) continue;
    const min = field.minItems ?? 1;
    const max = field.maxItems ?? Number.POSITIVE_INFINITY;
    if (tags.length < min || tags.length > max) {
      return `${field.label} necesita ${tagsRangeText(field)} palabras clave.`;
    }
  }
  return null;
}

const COP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/** 12000000 → "$ 12.000.000" (pesos colombianos, sin centavos). */
export function formatCOP(value: number) {
  return COP.format(value);
}
