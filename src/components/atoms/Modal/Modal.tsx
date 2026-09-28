"use client";

import { FormEvent, KeyboardEvent, ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "../Button/Button";
import { FormError } from "../FormError/FormError";
import type { ControlSize } from "../types";
import styles from "./Modal.module.css";

const FOCUSABLE = 'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href]';

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
  const titleId = useId();
  const dialogRef = useRef<HTMLFormElement>(null);
  // Mientras se guarda no se puede cerrar: la petición seguiría y su notificación aparecería sin el formulario.
  const requestClose = useRef(onClose);
  useEffect(() => {
    requestClose.current = () => {
      if (!isSubmitting) onClose();
    };
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") requestClose.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Al abrir, el foco va al primer campo; al cerrar vuelve al botón que abrió el modal.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstField = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (firstField ?? dialogRef.current)?.focus();
    return () => previous?.focus();
  }, []);

  // Mantiene el foco dentro del diálogo con Tab / Shift+Tab.
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSubmitting) onSubmit();
  };

  return (
    <div className={styles.overlay} onMouseDown={() => requestClose.current()}>
      {/* noValidate: la validación la hace cada formulario y la muestra en línea y en español;
          la nativa del navegador (min/max) bloqueaba el envío con su propio globo. */}
      <form
        ref={dialogRef}
        noValidate
        tabIndex={-1}
        className={styles.dialog}
        data-size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isSubmitting || undefined}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
      >
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
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
            {isSubmitting ? "Guardando…" : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
