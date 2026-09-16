import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "ghost" | "white";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  variant?: ButtonVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  const hasIcon = Boolean(leftIcon || rightIcon);
  const buttonClassName = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} className={buttonClassName}>
      {leftIcon ? <span className={styles.icon} aria-hidden>{leftIcon}</span> : null}
      <span className={hasIcon ? styles.labelWithIcon : styles.label}>{children}</span>
      {rightIcon ? <span className={styles.icon} aria-hidden>{rightIcon}</span> : null}
    </button>
  );
}
