"use client";

import { useSyncExternalStore } from "react";
import {
  closeNotification,
  getCurrentNotification,
  getServerNotification,
  subscribeNotifications,
} from "@/utils/notify";
import { NotificationDialog } from "../../molecules/NotificationDialog/NotificationDialog";

/** Muestra la notificación en curso de `notify`. Se monta una sola vez, en el layout raíz. */
export function NotificationHost() {
  const current = useSyncExternalStore(subscribeNotifications, getCurrentNotification, getServerNotification);

  if (!current) return null;

  return (
    <NotificationDialog
      key={current.id}
      tone={current.tone}
      title={current.title}
      message={current.message}
      confirmLabel={current.confirmLabel}
      cancelLabel={current.cancelLabel}
      onConfirm={() => closeNotification(current.id, true)}
      onCancel={() => closeNotification(current.id, false)}
    />
  );
}
