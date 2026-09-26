"use client";

import { FormEvent, ReactNode, useEffect } from "react";
import { Button } from "../Button/Button";
import { FormError } from "../FormError/FormError";
import type { ControlSize } from "../types";
import styles from "./Modal.module.css";

type ModalProps = {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string;
  dangerAction?: { label: string; onClick: () => void };
  /** Tamaño de todos los campos y botones del diálogo. */
  size?: ControlSize;
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
  size,
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
        data-size={size}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.body}>{children}</div>
        {error ? <FormError>{error}</FormError> : null}
        <div className={styles.footer}>
          {dangerAction ? (
            <Button variant="link" className={styles.danger} onClick={dangerAction.onClick} disabled={isSubmitting}>
              {dangerAction.label}
            </Button>
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
