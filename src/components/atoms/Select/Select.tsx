import { ChangeEvent, SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";
import { Spinner } from "../Spinner/Spinner";
import type { ControlSize } from "../types";
import styles from "./Select.module.css";

export type SelectOption<V extends string = string> = {
  value: V;
  label: string;
};

type SelectProps<V extends string> = Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "size" | "value"> & {
  label?: string;
  size?: ControlSize;
  helperText?: string;
  error?: string;
  options: SelectOption<V>[];
  value?: V;
  /** Recibe el valor ya tipado (una de las `options`): evita el `as` sobre `event.target.value`. */
  onValueChange?: (value: V) => void;
  /** Opciones cargando desde el backend: spinner en lugar del chevron y campo deshabilitado. */
  isLoading?: boolean;
};

export function Select<V extends string = string>({
  label,
  helperText,
  error,
  options,
  size,
  isLoading = false,
  id,
  className,
  disabled,
  onChange,
  onValueChange,
  ...props
}: SelectProps<V>) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-message`;
  const message = error ?? helperText;
  const selectClassName = [styles.select, error ? styles.selectError : ""].filter(Boolean).join(" ");
  const messageClassName = [styles.message, error ? styles.messageError : ""].filter(Boolean).join(" ");

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event);
    const option = options.find((candidate) => candidate.value === event.target.value);
    if (option) onValueChange?.(option.value);
  };

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
        <select
          id={selectId}
          {...props}
          onChange={handleChange}
          disabled={disabled || isLoading}
          aria-busy={isLoading || undefined}
          className={selectClassName}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={message ? messageId : undefined}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isLoading ? (
          <Spinner size="sm" label="" className={styles.chevron} />
        ) : (
          <ChevronDown className={styles.chevron} aria-hidden />
        )}
      </span>
      {message ? (
        <span id={messageId} className={messageClassName}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
