import { apiClient } from "./client";
import type { PageMeta } from "./interfaces/pagination";

// Tamaño máximo de página que acepta el backend (PaginationQueryDto: pageSize ≤ 100).
const MAX_PAGE_SIZE = 100;

/**
 * Trae todas las páginas de un listado paginado y devuelve los elementos juntos.
 * Se usa para buscar y filtrar sobre el total mientras el backend no tenga búsqueda propia.
 */
export async function fetchAllPages<T>(url: string, key: string): Promise<T[]> {
  const getPage = (page: number) =>
    apiClient.get<Record<string, T[] | PageMeta>>(url, { params: { page, pageSize: MAX_PAGE_SIZE } });

  const first = await getPage(1);
  const items = [...(first.data[key] as T[])];
  const { totalPages } = first.data.meta as PageMeta;
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getPage(page);
    items.push(...(response.data[key] as T[]));
  }
  return items;
}
