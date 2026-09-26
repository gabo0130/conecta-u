import { InputHTMLAttributes, ReactNode } from "react";
import type { ControlSize } from "../types";
import styles from "./Checkbox.module.css";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "type" | "size"> & {
  label: ReactNode;
  /** Sin valor hereda el tamaño del contenedor (`data-size`); por defecto md. */
  size?: ControlSize;
};

export function Checkbox({ label, size, className, ...props }: CheckboxProps) {
  return (
    <label data-size={size} className={[styles.field, className].filter(Boolean).join(" ")}>
      <input type="checkbox" {...props} className={styles.checkbox} />
      <span>{label}</span>
    </label>
  );
}
