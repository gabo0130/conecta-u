import { ReactNode } from "react";
import styles from "./PageGrid.module.css";

type PageGridProps = {
  /** Título, subtítulo y acciones de la página; ocupa todo el ancho de la grilla. */
  header?: ReactNode;
  /** Columna lateral (consejos, resumen, filtros). Desde xl va a la derecha; antes, debajo del contenido. */
  aside?: ReactNode;
  /**
   * narrow: una columna de lectura/formulario (820px).
   * wide: contenido que se reparte en columnas desde xl (1180px). Con `aside` siempre es wide.
   */
  width?: "narrow" | "wide";
  children: ReactNode;
};

/** Grilla de página: centra el contenido y ordena encabezado, contenido y columna lateral. */
export function PageGrid({ header, aside, width = "narrow", children }: PageGridProps) {
  const gridClassName = [styles.grid, aside || width === "wide" ? styles.wide : "", aside ? styles.withAside : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={gridClassName}>
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={styles.main}>{children}</div>
      {aside ? <aside className={styles.aside}>{aside}</aside> : null}
    </div>
  );
}
