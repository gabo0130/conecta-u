import type { SelectOption } from "@/components/atoms";

/**
 * Convierte un mapa de etiquetas (`ROLE_LABEL`) en opciones de `Select` con el valor tipado.
 * `Object.entries` pierde el tipo de las claves: esta es la única conversión y vive aquí.
 */
export function toOptions<K extends string, V>(
  labels: Record<K, V>,
  getLabel: (entry: V) => string = String,
): SelectOption<K>[] {
  return (Object.entries(labels) as [K, V][]).map(([value, entry]) => ({ value, label: getLabel(entry) }));
}
