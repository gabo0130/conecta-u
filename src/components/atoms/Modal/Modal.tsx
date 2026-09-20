"use client";

import { FormEvent, ReactNode, useEffect } from "react";
import { Button } from "../Button/Button";
import styles from "./Modal.module.css";

type ModalProps = {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string;
  dangerAction?: { label: string; onClick: () => void };
  children: ReactNode;
};

export function Modal({
  title,
  onClose,
  onSubmit,
  submitLabel = "Guardar",
  isSubmitting = false,
  error,
  dangerAction,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.body}>{children}</div>
        {error ? <div className={styles.error}>{error}</div> : null}
        <div className={styles.footer}>
          {dangerAction ? (
            <button type="button" className={styles.danger} onClick={dangerAction.onClick} disabled={isSubmitting}>
              {dangerAction.label}
            </button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
