import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary";

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
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const variantClass = isPrimary ? styles.primary : styles.secondary;
  const hasIcon = Boolean(leftIcon || rightIcon);

  const className = [styles.button, variantClass, props.className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      className={className}
    >
      {leftIcon ? <span className={styles.icon} aria-hidden>{leftIcon}</span> : null}
      <span className={hasIcon ? styles.labelWithIcon : styles.label}>{children}</span>
      {rightIcon ? <span className={styles.icon} aria-hidden>{rightIcon}</span> : null}
    </button>
  );
}
