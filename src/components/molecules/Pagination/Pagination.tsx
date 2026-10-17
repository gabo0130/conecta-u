import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { Button, IconButton } from "../../atoms";
import styles from "./Pagination.module.css";

type PaginationProps = {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  /** Para columnas angostas (p. ej. la lateral de 340 px): botones de solo ícono y sin padding propio. */
  compact?: boolean;
};

/** Pager simple (anterior/siguiente + "página X de Y") para listados paginados por el backend. */
export function Pagination({ meta, onPageChange, compact = false }: PaginationProps) {
  const { page, totalPages, total } = meta;
  if (total === 0) return null;

  const previous = { disabled: page <= 1, onClick: () => onPageChange(page - 1) };
  const next = { disabled: page >= totalPages, onClick: () => onPageChange(page + 1) };

  return (
    <div className={[styles.bar, compact && styles.compact].filter(Boolean).join(" ")}>
      <span className={styles.count}>{total === 1 ? "1 resultado" : `${total} resultados`}</span>
      <div className={styles.controls}>
        {compact ? (
          <IconButton size="sm" label="Página anterior" icon={<ChevronLeft />} {...previous} />
        ) : (
          <Button variant="ghost" size="sm" leftIcon={<ChevronLeft />} {...previous}>
            Anterior
          </Button>
        )}
        <span className={styles.page}>
          {compact ? `${page} de ${totalPages}` : `Página ${page} de ${totalPages}`}
        </span>
        {compact ? (
          <IconButton size="sm" label="Página siguiente" icon={<ChevronRight />} {...next} />
        ) : (
          <Button variant="ghost" size="sm" rightIcon={<ChevronRight />} {...next}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
