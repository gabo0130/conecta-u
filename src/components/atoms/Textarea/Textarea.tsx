import { TextareaHTMLAttributes, useId } from "react";
import type { ControlSize } from "../types";
import styles from "./Textarea.module.css";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style"> & {
  label?: string;
  size?: ControlSize;
  helperText?: string;
  error?: string;
};

export function Textarea({
  label,
  helperText,
  error,
  size,
  id,
  className,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const messageId = `${textareaId}-message`;
  const message = error ?? helperText;
  const textareaClassName = [styles.textarea, error ? styles.textareaError : ""]
    .filter(Boolean)
    .join(" ");
  const messageClassName = [styles.message, error ? styles.messageError : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={textareaId} data-size={size} className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
        className={textareaClassName}
      />
      {message ? (
        <span id={messageId} className={messageClassName}>
          {message}
        </span>
      ) : null}
    </label>
  );
}
