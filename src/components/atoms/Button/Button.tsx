import { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import type { ControlSize } from "../types";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "ghost" | "white" | "link";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  variant?: ButtonVariant;
  /** Sin valor hereda el tamaño del contenedor (`data-size`); por defecto md. */
  size?: ControlSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export function Button({
  variant = "primary",
  size,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const hasIcon = Boolean(leftIcon || rightIcon);
  const buttonClassName = [styles.button, styles[variant], fullWidth ? styles.full : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} type={type} data-size={size} className={buttonClassName}>
      {leftIcon ? <span className={styles.icon} aria-hidden>{leftIcon}</span> : null}
      <span className={hasIcon ? styles.labelWithIcon : styles.label}>{children}</span>
      {rightIcon ? <span className={styles.icon} aria-hidden>{rightIcon}</span> : null}
    </button>
  );
}
