import type { ReactNode } from "react";

/**
 * Notificaciones en modal, llamables desde cualquier parte de la app (componentes, hooks o utilidades):
 *
 *   notify.success("Proyecto registrado");
 *   notify.error(getErrorMessage(err, "No se pudo guardar el proyecto."));
 *   if (await notify.confirm({ message: "¿Eliminar esta experiencia?", tone: "danger" })) { ... }
 *
 * Se muestran de a una, en orden de llegada, en el <NotificationHost /> montado en el layout raíz.
 * Cada llamada devuelve una promesa que se resuelve cuando la persona cierra el modal
 * (en `confirm`, con `true` si acepta y `false` si cancela).
 */

export type NotificationTone = "info" | "success" | "warning" | "error";

export type NotifyOptions = {
  title?: string;
  /** Texto del botón para cerrar. */
  actionLabel?: string;
};

export type ConfirmOptions = {
  message: ReactNode;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger: acciones destructivas o irreversibles (eliminar). */
  tone?: "default" | "danger";
};

export type NotificationItem = {
  id: number;
  kind: "notice" | "confirm";
  tone: NotificationTone | "confirm" | "danger";
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  resolve: (accepted: boolean) => void;
};

const DEFAULTS: Record<NotificationTone, { title: string; actionLabel: string }> = {
  success: { title: "¡Listo!", actionLabel: "Entendido" },
  info: { title: "Información", actionLabel: "Entendido" },
  warning: { title: "Atención", actionLabel: "Entendido" },
  error: { title: "Algo salió mal", actionLabel: "Cerrar" },
};

let queue: NotificationItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function push(item: Omit<NotificationItem, "id" | "resolve">) {
  return new Promise<boolean>((resolve) => {
    queue = [...queue, { ...item, id: nextId++, resolve }];
    emit();
  });
}

function show(tone: NotificationTone, message: ReactNode, options: NotifyOptions = {}) {
  return push({
    kind: "notice",
    tone,
    title: options.title ?? DEFAULTS[tone].title,
    message,
    confirmLabel: options.actionLabel ?? DEFAULTS[tone].actionLabel,
  }).then(() => undefined);
}

export const notify = {
  success: (message: ReactNode, options?: NotifyOptions) => show("success", message, options),
  info: (message: ReactNode, options?: NotifyOptions) => show("info", message, options),
  warning: (message: ReactNode, options?: NotifyOptions) => show("warning", message, options),
  error: (message: ReactNode, options?: NotifyOptions) => show("error", message, options),
  confirm: ({ message, title, confirmLabel, cancelLabel, tone = "default" }: ConfirmOptions) =>
    push({
      kind: "confirm",
      tone: tone === "danger" ? "danger" : "confirm",
      title: title ?? "¿Estás seguro?",
      message,
      confirmLabel: confirmLabel ?? (tone === "danger" ? "Eliminar" : "Confirmar"),
      cancelLabel: cancelLabel ?? "Cancelar",
    }),
};

/* ---- Lectura del estado para <NotificationHost /> (useSyncExternalStore) ---- */

export function subscribeNotifications(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCurrentNotification(): NotificationItem | null {
  return queue[0] ?? null;
}

export function getServerNotification(): NotificationItem | null {
  return null;
}

export function closeNotification(id: number, accepted: boolean) {
  const item = queue.find((entry) => entry.id === id);
  if (!item) return;
  queue = queue.filter((entry) => entry.id !== id);
  emit();
  item.resolve(accepted);
}
