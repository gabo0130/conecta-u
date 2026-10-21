import { apiClient } from "./client";
import type { PageMeta } from "./interfaces/pagination";

// Tamaño máximo de página que acepta el backend (PaginationQueryDto: pageSize ≤ 100).
const MAX_PAGE_SIZE = 100;

/** Filtros que se envían en cada página (p. ej. `{ q, status }`); los `undefined` no viajan. */
export type PageParams = Record<string, string | number | undefined>;

/**
 * Trae todas las páginas de un listado paginado y devuelve los elementos juntos.
 * Se usa para buscar y filtrar sobre el total mientras el backend no tenga búsqueda propia.
 */
export async function fetchAllPages<T>(
  url: string,
  key: string,
  params: PageParams = {},
  signal?: AbortSignal,
): Promise<T[]> {
  // Con `signal` abortado se corta también el bucle de páginas, no solo la respuesta.
  const getPage = (page: number) =>
    apiClient.get<Record<string, T[] | PageMeta>>(url, { params: { ...params, page, pageSize: MAX_PAGE_SIZE }, signal });

  const first = await getPage(1);
  const items = [...(first.data[key] as T[])];
  const { totalPages } = first.data.meta as PageMeta;
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getPage(page);
    items.push(...(response.data[key] as T[]));
  }
  return items;
}
