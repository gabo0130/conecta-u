import { ChangeEvent } from "react";
import { dashboardTokens } from "../../dashboard-tokens";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar seccion...",
}: SearchBarProps) {
  return (
    <label className={styles.search}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="4.5" stroke={dashboardTokens.colorTextMuted} strokeWidth="1.2" />
        <path
          d="M9.5 9.5L12 12"
          stroke={dashboardTokens.colorTextMuted}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
      />
    </label>
  );
}
