import { TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.css";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style"> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export function Textarea({
  label,
  helperText,
  error,
  id,
  className,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const message = error ?? helperText;
  const textareaClassName = [styles.textarea, error ? styles.textareaError : ""]
    .filter(Boolean)
    .join(" ");
  const messageClassName = [styles.message, error ? styles.messageError : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={textareaId} className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea id={textareaId} {...props} className={textareaClassName} />
      {message ? <span className={messageClassName}>{message}</span> : null}
    </label>
  );
}
