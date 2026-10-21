export type SortDirection = "asc" | "desc";

/** Orden de una tabla: una sola columna a la vez; `null` = el orden en que llegan los datos. */
export type SortState<K extends string> = { key: K; direction: SortDirection } | null;

/** Valor por el que se compara una fila: texto, número, o vacío (siempre al final). */
export type SortValue = string | number | null | undefined;

export type SortAccessors<T, K extends string> = Record<K, (row: T) => SortValue>;

// "es" + numeric: "Ana" = "ana", "Álvaro" junto a "Alvaro" y "Fila 10" después de "Fila 9".
const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

/** Ciclo al pulsar una columna: ascendente → descendente → sin orden. Otra columna empieza en ascendente. */
export function nextSort<K extends string>(current: SortState<K>, key: K): SortState<K> {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

function isEmpty(value: SortValue): value is null | undefined | "" {
  return value === null || value === undefined || value === "";
}

function compareValues(a: SortValue, b: SortValue): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

/** Copia ordenada (estable: los empates conservan el orden original). Los vacíos van al final en ambos sentidos. */
export function sortItems<T, K extends string>(items: T[], sort: SortState<K>, accessors: SortAccessors<T, K>): T[] {
  if (!sort) return items;
  const accessor = accessors[sort.key];
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((rowA, rowB) => {
    const a = accessor(rowA);
    const b = accessor(rowB);
    if (isEmpty(a) || isEmpty(b)) return Number(isEmpty(a)) - Number(isEmpty(b));
    return compareValues(a, b) * factor;
  });
}
