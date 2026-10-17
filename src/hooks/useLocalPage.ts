"use client";

import { useState } from "react";
import { paginateLocally } from "@/utils/paginate";

/**
 * Paginación en el cliente de una lista ya filtrada u ordenada. Vuelve a la página 1 cada vez
 * que cambia `resetKey` (búsqueda, filtros u orden), sin un efecto que lo sincronice.
 */
export function useLocalPage<T>(items: T[], resetKey: string, pageSize: number) {
  const [state, setState] = useState({ key: "", page: 1 });
  const { pageItems, meta } = paginateLocally(items, state.key === resetKey ? state.page : 1, pageSize);
  return { pageItems, meta, setPage: (page: number) => setState({ key: resetKey, page }) };
}
