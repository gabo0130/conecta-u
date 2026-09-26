import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { Button } from "../../atoms";
import styles from "./Pagination.module.css";

type PaginationProps = {
  meta: PageMeta;
  onPageChange: (page: number) => void;
};

/** Pager simple (anterior/siguiente + "página X de Y") para listados paginados por el backend. */
export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = meta;
  if (total === 0) return null;

  return (
    <div className={styles.bar}>
      <span className={styles.count}>{total === 1 ? "1 resultado" : `${total} resultados`}</span>
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft />}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className={styles.page}>
          Página {page} de {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          rightIcon={<ChevronRight />}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
