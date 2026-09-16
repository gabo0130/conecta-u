import { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style"> & {
  label: string;
  helperText?: string;
  error?: string;
};

export function Input({ label, helperText, error, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const message = error ?? helperText;
  const inputClassName = [styles.input, error ? styles.inputError : ""].filter(Boolean).join(" ");
  const messageClassName = [styles.message, error ? styles.messageError : ""].filter(Boolean).join(" ");

  return (
    <label
      htmlFor={inputId}
      className={styles.field}
    >
      <span>{label}</span>
      <input
        id={inputId}
        {...props}
        className={inputClassName}
      />
      {message ? (
        <span className={messageClassName}>{message}</span>
      ) : null}
    </label>
  );
}