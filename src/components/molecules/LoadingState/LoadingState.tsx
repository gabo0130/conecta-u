import { Spinner } from "../../atoms";
import styles from "./LoadingState.module.css";

type LoadingStateProps = {
  /** Qué se está cargando: "Cargando proyectos…". */
  message: string;
  /** page: ocupa la zona de contenido de una pantalla; section: dentro de una tarjeta o lista. */
  variant?: "page" | "section";
};

/** Estado "cargando" de una pantalla o sección que espera datos del backend: spinner + mensaje. */
export function LoadingState({ message, variant = "section" }: LoadingStateProps) {
  return (
    <div className={[styles.state, styles[variant]].join(" ")} role="status" aria-live="polite">
      <Spinner size={variant === "page" ? "xl" : "lg"} label="" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
