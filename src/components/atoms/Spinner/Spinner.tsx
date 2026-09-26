import type { ControlSize } from "../types";
import styles from "./Spinner.module.css";

type SpinnerProps = {
  size?: ControlSize;
  /** Texto para lectores de pantalla; si el spinner acompaña un texto visible, dejarlo vacío. */
  label?: string;
  className?: string;
};

/** Indicador de carga circular (único en la app: carga global, estado del servidor, rutas protegidas). */
export function Spinner({ size = "md", label = "Cargando", className }: SpinnerProps) {
  return (
    <span
      className={[styles.spinner, styles[size], className].filter(Boolean).join(" ")}
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    />
  );
}
