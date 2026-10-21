import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { SortState } from "@/utils/sort";
import styles from "./SortableHeader.module.css";

type SortableHeaderProps<K extends string> = {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onSort: (key: K) => void;
  /** Clase de la celda en la tabla (p. ej. la de columnas numéricas alineadas a la derecha). */
  className?: string;
  align?: "start" | "end";
  /** Mientras falta un dato para comparar (p. ej. el catálogo de programas aún carga). */
  disabled?: boolean;
};

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

/** Encabezado de columna ordenable: un clic cicla ascendente → descendente → sin orden. */
export function SortableHeader<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className,
  align = "start",
  disabled = false,
}: SortableHeaderProps<K>) {
  const direction = sort?.key === sortKey ? sort.direction : null;
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ChevronsUpDown;
  const hint =
    direction === "asc" ? "Orden ascendente. Pulsa para invertir" : direction === "desc" ? "Orden descendente. Pulsa para quitar el orden" : "Pulsa para ordenar";

  return (
    <th className={className} aria-sort={direction ? ARIA_SORT[direction] : "none"}>
      <button
        type="button"
        className={[styles.button, align === "end" && styles.end, direction && styles.active].filter(Boolean).join(" ")}
        title={disabled ? "Cargando…" : hint}
        disabled={disabled}
        onClick={() => onSort(sortKey)}
      >
        <span>{label}</span>
        <Icon size={14} aria-hidden />
      </button>
    </th>
  );
}
