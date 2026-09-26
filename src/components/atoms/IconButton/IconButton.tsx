import { ButtonHTMLAttributes, ReactNode } from "react";
import type { ControlSize } from "../types";
import styles from "./IconButton.module.css";

type IconButtonVariant = "ghost" | "plain";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "children"> & {
  /** Obligatorio: es el único texto que lee un lector de pantalla. */
  label: string;
  icon: ReactNode;
  /** ghost: con borde (junto a un campo); plain: sin borde (acciones dentro de una tarjeta). */
  variant?: IconButtonVariant;
  size?: ControlSize;
  tone?: "default" | "danger";
};

/** Botón cuadrado de solo ícono; mide lo mismo que un campo del mismo tamaño. */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size,
  tone = "default",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const buttonClassName = [styles.button, styles[variant], tone === "danger" ? styles.danger : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} type={type} data-size={size} aria-label={label} title={label} className={buttonClassName}>
      {icon}
    </button>
  );
}
