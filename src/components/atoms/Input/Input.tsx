import { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.css";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style"> & {
  label?: string;
  helperText?: string;
  error?: string;
  rightIcon?: ReactNode;
};

export function Input({
  label,
  helperText,
  error,
  rightIcon,
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
    <label htmlFor={inputId} className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={controlClassName}>
        <input id={inputId} {...props} className={styles.input} />
        {rightIcon ? <span className={styles.right} aria-hidden>{rightIcon}</span> : null}
      </span>
      {message ? <span className={messageClassName}>{message}</span> : null}
    </label>
  );
}
