import { ReactNode } from "react";
import type { ControlSize } from "../types";
import styles from "./FormError.module.css";

type FormErrorProps = {
  children: ReactNode;
  size?: ControlSize;
  className?: string;
};

/** Mensaje de error de un formulario completo (validación o respuesta del backend). */
export function FormError({ children, size, className }: FormErrorProps) {
  return (
    <div role="alert" data-size={size} className={[styles.error, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
