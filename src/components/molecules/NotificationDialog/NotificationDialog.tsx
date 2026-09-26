"use client";

import { KeyboardEvent, ReactNode, useEffect, useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, Info, LucideIcon, XCircle } from "lucide-react";
import type { NotificationItem } from "@/utils/notify";
import { Button } from "../../atoms";
import styles from "./NotificationDialog.module.css";

type NotificationDialogProps = {
  tone: NotificationItem["tone"];
  title: string;
  message: ReactNode;
  confirmLabel: string;
  /** Solo en confirmaciones: muestra el botón de cancelar. */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ICONS: Record<NotificationItem["tone"], LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  confirm: HelpCircle,
  danger: AlertTriangle,
};

export function NotificationDialog({
  tone,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: NotificationDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const Icon = ICONS[tone];

  // Al abrir, el foco va al botón seguro (Cancelar en acciones destructivas) y al cerrar vuelve
  // al elemento que lo tenía antes.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    (tone === "danger" ? cancelRef.current : confirmRef.current)?.focus();
    return () => previous?.focus?.();
  }, [tone]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
      return;
    }
    // Mantiene el foco dentro del diálogo.
    if (event.key === "Tab") {
      const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
      if (buttons.length === 0) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={onCancel}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className={styles.dialog}
        data-tone={tone}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.icon} aria-hidden>
          <Icon />
        </span>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div id={messageId} className={styles.message}>
          {message}
        </div>
        <div className={styles.actions}>
          {cancelLabel ? (
            <Button ref={cancelRef} variant="ghost" onClick={onCancel} className={styles.action}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button ref={confirmRef} onClick={onConfirm} className={styles.action}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
