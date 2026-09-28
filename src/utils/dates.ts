const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Convierte una fecha del backend en Date sin desplazarla de día.
 * "2024-03-01" (columna `date`, sin hora) se lee como día local: con new Date() se lee en UTC y
 * en Colombia (UTC−5) se mostraría el 29 de febrero. Las fechas con hora (ISO completo) se leen tal cual.
 */
export function parseDate(value: string) {
  const match = DATE_ONLY.exec(value);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(value);
}

export function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  return parseDate(value).toLocaleDateString("es-CO", options);
}
