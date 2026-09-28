import type { PageMeta } from "@/apis/interfaces/pagination";

/** Pagina en el cliente una lista ya filtrada, con el mismo `meta` que devuelve el backend. */
export function paginateLocally<T>(items: T[], page: number, pageSize: number): { pageItems: T[]; meta: PageMeta } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    meta: { page: current, pageSize, total: items.length, totalPages },
  };
}
