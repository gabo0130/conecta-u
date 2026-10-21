import { Button, Spinner } from "../../atoms";
import styles from "./TableStatus.module.css";

type TableStatusProps = {
  isRefreshing: boolean;
  error: string;
  onRetry: () => void;
  /** Si hay un orden activo, ofrece quitarlo: sin él la tabla vuelve a la página del backend. */
  onClearSort?: () => void;
};

/** Línea sobre una tabla con filas visibles: "actualizando" mientras llegan datos, o el error con salidas. */
export function TableStatus({ isRefreshing, error, onRetry, onClearSort }: TableStatusProps) {
  if (error) {
    return (
      <div className={[styles.status, styles.error].join(" ")} role="alert">
        <span>{error}</span>
        <Button variant="link" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
        {onClearSort ? (
          <Button variant="link" size="sm" onClick={onClearSort}>
            Quitar orden
          </Button>
        ) : null}
      </div>
    );
  }
  if (!isRefreshing) return null;
  return (
    <div className={styles.status} role="status">
      <Spinner size="sm" label="" />
      <span>Actualizando…</span>
    </div>
  );
}
