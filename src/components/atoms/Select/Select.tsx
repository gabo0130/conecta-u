import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import type { ControlSize } from "../types";
import styles from "./Select.module.css";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "size"> & {
  label?: string;
  size?: ControlSize;
  helperText?: string;
  error?: string;
  options: SelectOption[];
};

export function Select({ label, helperText, error, options, size, id, className, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const message = error ?? helperText;
  const selectClassName = [styles.select, error ? styles.selectError : ""].filter(Boolean).join(" ");
  const messageClassName = [styles.message, error ? styles.messageError : ""].filter(Boolean).join(" ");

  // El <select> no va dentro del <label>: en Firefox el label reenvía el clic al control y
  // la lista se abre y se cierra de inmediato. Se asocian por htmlFor.
  return (
    <div data-size={size} className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <span className={styles.control}>
        <select id={selectId} {...props} className={selectClassName} aria-invalid={Boolean(error) || undefined}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.chevron} aria-hidden />
      </span>
      {message ? <span className={messageClassName}>{message}</span> : null}
    </div>
  );
}
