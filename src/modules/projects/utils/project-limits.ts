// v2.2, E5: mismos límites que el backend (columnas de `projects` y su CHECK).
export const PROJECT_ENTITY_MAX_LENGTH = 150;
export const PROJECT_DURATION_MONTHS = { min: 1, max: 60 } as const;

/** "1 mes", "6 meses"; null en proyectos anteriores a v2.2. */
export function formatDuration(months: number | null | undefined) {
  if (months === null || months === undefined) return null;
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}
