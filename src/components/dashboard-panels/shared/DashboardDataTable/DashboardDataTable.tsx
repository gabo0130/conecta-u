"use client";

import { ReactNode, useMemo, useState } from "react";
import { Button } from "../../../atoms";
import styles from "./DashboardDataTable.module.css";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
};

export type DataTableFilter<T> = {
  id: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  predicate: (row: T, selectedValue: string) => boolean;
  defaultValue?: string;
};

type DashboardDataTableProps<T> = {
  title?: string;
  description?: string;
  rows: T[];
  rowKey: (row: T) => string;
  columns: Array<DataTableColumn<T>>;
  filters?: Array<DataTableFilter<T>>;
  searchPlaceholder?: string;
  searchPredicate?: (row: T, searchValue: string) => boolean;
  emptyMessage?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onRowClick?: (row: T) => void;
  footer?: ReactNode;
};

export function DashboardDataTable<T>({
  title,
  description,
  rows,
  rowKey,
  columns,
  filters = [],
  searchPlaceholder = "Buscar...",
  searchPredicate,
  emptyMessage = "No hay registros para mostrar.",
  pageSizeOptions = [5, 10, 20],
  defaultPageSize = 10,
  onRowClick,
  footer,
}: DashboardDataTableProps<T>) {
  const initialFilterState = useMemo(() => {
    const entries = filters.map((filter) => [filter.id, filter.defaultValue ?? "all"]);
    return Object.fromEntries(entries) as Record<string, string>;
  }, [filters]);

  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilterState);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  const normalizedSearch = searchValue.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = searchPredicate
        ? searchPredicate(row, normalizedSearch)
        : true;

      if (!matchesSearch) {
        return false;
      }

      return filters.every((filter) => {
        const selectedValue = filterValues[filter.id] ?? "all";
        if (selectedValue === "all") {
          return true;
        }
        return filter.predicate(row, selectedValue);
      });
    });
  }, [rows, searchPredicate, normalizedSearch, filters, filterValues]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const handleFilterChange = (filterId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const rowClassName = onRowClick ? styles.rowInteractive : undefined;

  return (
    <section className={styles.tableWrap}>
      <div className={styles.header}>
        <div>
          {title ? <h3>{title}</h3> : null}
          {description ? <p className={styles.meta}>{description}</p> : null}
        </div>

        <div className={styles.controls}>
          <input
            type="search"
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={(event) => handleSearchChange(event.target.value)}
            className={styles.search}
          />

          {filters.map((filter) => (
            <select
              key={filter.id}
              className={styles.select}
              value={filterValues[filter.id] ?? "all"}
              onChange={(event) => handleFilterChange(filter.id, event.target.value)}
              aria-label={filter.label}
            >
              <option value="all">{filter.label}: Todos</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      <div className={styles.tableScroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={rowClassName}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td key={column.id}>{column.cell(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        {footer ? <div>{footer}</div> : <span />}

        <div className={styles.pagination}>
          <span className={styles.meta}>
            Página {safePage} de {pageCount}
          </span>
          <select
            className={styles.select}
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            aria-label="Registros por página"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            disabled={safePage >= pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  );
}
