import type { InputHTMLAttributes } from "react";
import Link from "next/link";
import { Checkbox } from "../../atoms";
import styles from "./LegalCheckbox.module.css";

type LegalCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "type" | "size"> & {
  label: string;
  /** Página pública con el texto completo; se abre en otra pestaña para no perder lo escrito. */
  href: string;
};

/** Casilla de aceptación con su enlace «Ver texto» (autorización de datos, declaración de veracidad). */
export function LegalCheckbox({ label, href, ...props }: LegalCheckboxProps) {
  return (
    <div className={styles.wrap}>
      <Checkbox label={label} {...props} />
      <Link href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
        Ver texto
        <span className={styles.srOnly}> de «{label}» (se abre en otra pestaña)</span>
      </Link>
    </div>
  );
}
