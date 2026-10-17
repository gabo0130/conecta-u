"use client";

import type { PageParams } from "@/apis/fetch-all-pages";
import type { PageMeta } from "@/apis/interfaces/pagination";
import type { SortAccessors } from "@/utils/sort";
import { useAllPages } from "./useAllPages";
import { useLocalPage } from "./useLocalPage";
import { useTableSort } from "./useTableSort";

/** La página que entrega el hook de datos del listado (`useUsers`, `useImportRuns`, …). */
export type ServerPage<T> = {
  items: T[];
  meta: PageMeta | null;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
};

type PagedTableOptions<T, K extends string> = {
  server: ServerPage<T>;
  /** Ruta y clave de la lista en la respuesta, para traer todas las páginas al ordenar o filtrar. */
  url: string;
  key: string;
  errorMessage: string;
  accessors: SortAccessors<T, K>;
  pageSize: number;
  /** Filtros que ya aplica el backend (deben ser estables: memorizados). */
  params?: PageParams;
  /** Filtro en el cliente y la clave que cambia con él (vacía = sin filtro activo). */
  filter?: (row: T) => boolean;
  filterKey?: string;
};

/**
 * Tabla paginada por el backend que se puede ordenar (y filtrar en el cliente): sin orden ni filtro
 * muestra la página del backend; con orden o filtro trae todas las páginas, las ordena y pagina aquí.
 */
export function usePagedTable<T, K extends string>(options: PagedTableOptions<T, K>) {
  const { server, url, key, errorMessage, accessors, pageSize, params, filter, filterKey = "" } = options;
  const { sort, isSorted, sortKey, toggleSort, clearSort, applySort } = useTableSort(accessors);
  const isFiltering = filterKey !== "";
  const usesAll = isSorted || isFiltering;
  const all = useAllPages<T>(url, key, usesAll, errorMessage, params);
  const local = useLocalPage(
    applySort(filter ? all.items.filter(filter) : all.items),
    [filterKey, sortKey, JSON.stringify(params ?? {})].join("|"),
    pageSize,
  );
  // Al ordenar por primera vez se sigue mostrando la página del backend mientras llega el resto, para
  // no desmontar la tabla (ni perder el foco del encabezado). Con un filtro no: mostraría filas que no cumplen.
  const showServer = !usesAll || (!all.hasItems && !isFiltering);

  return {
    rows: showServer ? server.items : local.pageItems,
    meta: showServer ? server.meta : local.meta,
    onPageChange: showServer ? server.setPage : local.setPage,
    /** No hay nada que mostrar todavía: la pantalla muestra el estado de carga. */
    isLoading: showServer ? server.isLoading : !all.hasItems,
    /** Se está trayendo todo (o volviendo a traer) con filas ya visibles. */
    isRefreshing: usesAll && all.isLoading && !(showServer && server.isLoading),
    error: usesAll ? all.error : server.error,
    retry: usesAll ? all.invalidate : () => void server.reload(),
    sort,
    isSorted,
    toggleSort,
    clearSort,
    /** Envuelve una mutación para que, al terminar, también se refresque la lista completa. */
    withRefresh:
      <A extends unknown[]>(action: (...args: A) => Promise<void>) =>
      async (...args: A) => {
        await action(...args);
        all.invalidate();
      },
  };
}
