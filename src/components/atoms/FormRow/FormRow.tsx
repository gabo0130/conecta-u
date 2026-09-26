import { HTMLAttributes } from "react";
import type { ControlSize } from "../types";
import styles from "./FormRow.module.css";

type FormRowProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
  columns?: 1 | 2 | 3;
  /** Tamaño de todos los controles de la fila. */
  size?: ControlSize;
};

/** Fila de campos con columnas del mismo ancho; en móvil se apila en una columna y se abre desde sm. */
export function FormRow({ columns = 2, size, className, ...props }: FormRowProps) {
  const rowClassName = [styles.row, styles[`cols${columns}`], className].filter(Boolean).join(" ");

  return <div {...props} data-size={size} className={rowClassName} />;
}
