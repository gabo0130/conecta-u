import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "style"> & {
  label?: string;
  options: SelectOption[];
};

export function Select({ label, options, id, className, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={selectId} className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.control}>
        <select id={selectId} {...props} className={styles.select}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className={styles.chevron} aria-hidden />
      </span>
    </label>
  );
}
