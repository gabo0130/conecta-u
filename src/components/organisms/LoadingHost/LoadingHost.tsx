"use client";

import { useSyncExternalStore } from "react";
import { getCurrentLoading, getServerLoading, subscribeLoading } from "@/utils/loading";
import { Spinner } from "../../atoms";
import styles from "./LoadingHost.module.css";

/** Overlay de carga global de `loading`. Se monta una sola vez, en el layout raíz. */
export function LoadingHost() {
  const current = useSyncExternalStore(subscribeLoading, getCurrentLoading, getServerLoading);

  if (!current) return null;

  // Bloquea los clics desde el primer instante (evita dobles envíos), pero solo se hace visible
  // si la acción dura más de ~200 ms: las acciones rápidas no parpadean.
  return (
    <div className={styles.overlay} role="status" aria-live="assertive" aria-busy="true">
      <div className={styles.box}>
        <Spinner size="xl" label="" />
        <p className={styles.message}>{current.message}</p>
      </div>
    </div>
  );
}
