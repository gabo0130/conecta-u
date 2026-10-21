"use client";

import { useState } from "react";
import { nextSort, sortItems } from "@/utils/sort";
import type { SortAccessors, SortState } from "@/utils/sort";

/**
 * Orden de una tabla por una columna (ascendente → descendente → sin orden).
 * `accessors` dice qué valor de la fila se compara en cada columna; se usa el del render actual
 * (no se memoriza), así que puede depender de datos de la pantalla, como un catálogo.
 */
export function useTableSort<T, K extends string>(accessors: SortAccessors<T, K>) {
  const [sort, setSort] = useState<SortState<K>>(null);

  return {
    sort,
    isSorted: sort !== null,
    /** Cambia cada vez que cambia el orden: sirve para volver a la página 1. */
    sortKey: sort ? `${sort.key}:${sort.direction}` : "",
    toggleSort: (key: K) => setSort((current) => nextSort(current, key)),
    clearSort: () => setSort(null),
    applySort: (items: T[]) => sortItems(items, sort, accessors),
  };
}
