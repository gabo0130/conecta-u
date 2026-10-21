"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../atoms";
import styles from "./TagsInput.module.css";

/** Mismo límite que el backend (TAG_MAX_LENGTH). */
const TAG_MAX_LENGTH = 40;

type TagsInputProps = {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  /** Máximo de palabras clave; al llegar, el campo deja de aceptar más. */
  max?: number;
  helperText?: string;
  disabled?: boolean;
};

/** Lista de palabras clave (v2.1, A6): Enter o coma agrega, la × de cada chip la quita. */
export function TagsInput({ label, value, onChange, max, helperText, disabled = false }: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const isFull = max !== undefined && value.length >= max;

  const add = () => {
    const tag = draft.trim().replace(/,+$/, "").trim();
    if (!tag) return;
    if (tag.length > TAG_MAX_LENGTH) {
      setError(`Cada palabra clave admite máximo ${TAG_MAX_LENGTH} caracteres.`);
      return;
    }
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setError(`"${tag}" ya está en la lista.`);
      return;
    }
    if (isFull) return;
    onChange([...value, tag]);
    setDraft("");
    setError("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={styles.field}>
      <Input
        label={label}
        value={draft}
        placeholder={isFull ? "Llegaste al máximo de palabras clave" : "Escribe y pulsa Enter"}
        onChange={(event) => {
          setDraft(event.target.value);
          setError("");
        }}
        onKeyDown={handleKeyDown}
        onBlur={add}
        disabled={disabled || isFull}
        error={error || undefined}
        helperText={helperText}
      />
      {value.length > 0 ? (
        <ul className={styles.tags} aria-label={`${label}: ${value.length} agregadas`}>
          {value.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
              {!disabled ? (
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Quitar ${tag}`}
                  onClick={() => onChange(value.filter((item) => item !== tag))}
                >
                  <X size={13} aria-hidden />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
