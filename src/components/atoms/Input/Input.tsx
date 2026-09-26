import { InputHTMLAttributes, ReactNode } from "react";
import type { ControlSize } from "../types";
import styles from "./Input.module.css";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "size"> & {
  label?: string;
  /** Sin valor hereda el tamaño del contenedor (`data-size`); por defecto md. */
  size?: ControlSize;
  helperText?: string;
  error?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  rightIconLabel?: string;
};

export function Input({
  label,
  helperText,
  error,
  rightIcon,
  onRightIconClick,
  rightIconLabel,
  size,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const message = error ?? helperText;
  const controlClassName = [styles.control, error ? styles.controlError : ""]
    .filter(Boolean)
    .join(" ");
  const messageClassName = [styles.message, error ? styles.messageError : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={inputId} data-size={size} className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={controlClassName}>
        <input id={inputId} {...props} className={styles.input} />
        {rightIcon ? (
          onRightIconClick ? (
            <button
              type="button"
              className={`${styles.right} ${styles.rightButton}`}
              onClick={onRightIconClick}
              aria-label={rightIconLabel}
            >
              {rightIcon}
            </button>
          ) : (
            <span className={styles.right} aria-hidden>
              {rightIcon}
            </span>
          )
        ) : null}
      </span>
      {message ? <span className={messageClassName}>{message}</span> : null}
    </label>
  );
}
