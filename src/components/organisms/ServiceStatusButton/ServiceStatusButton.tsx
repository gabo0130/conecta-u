"use client";

import { useState, useSyncExternalStore } from "react";
import { Activity } from "lucide-react";
import {
  diagnose,
  getServerServiceState,
  getServiceState,
  subscribeServiceStatus,
  type ServiceStatus,
} from "@/utils/service-status";
import { notify } from "@/utils/notify";
import { Spinner } from "../../atoms";
import styles from "./ServiceStatusButton.module.css";

const STATUS_LABEL: Record<ServiceStatus, string> = {
  idle: "sin verificar",
  checking: "verificando",
  waking: "levantándose",
  online: "en línea",
  offline: "sin conexión",
};

type ServiceStatusButtonProps = {
  /** compact: solo ícono (barra superior); full: ícono + texto (login y registro). */
  variant?: "compact" | "full";
};

/**
 * Botón de diagnóstico/levantamiento del servidor: el punto muestra el estado actual y al pulsarlo
 * mide la respuesta de /health; si el servidor está en reposo, esa misma petición lo despierta.
 */
export function ServiceStatusButton({ variant = "compact" }: ServiceStatusButtonProps) {
  const service = useSyncExternalStore(subscribeServiceStatus, getServiceState, getServerServiceState);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const label = `Estado del servidor: ${STATUS_LABEL[service.status]}`;

  const handleClick = async () => {
    setIsDiagnosing(true);
    try {
      const result = await diagnose();
      if (result.ok) {
        void notify.success(`El servidor respondió en ${result.latencyMs} ms.`, { title: "Servidor en línea" });
      } else {
        void notify.warning(
          `${result.reason} Lo estamos levantando: puede tardar hasta 5 minutos y te avisaremos cuando esté listo.`,
          { title: "Servidor en reposo" },
        );
      }
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <button
      type="button"
      className={[styles.button, styles[variant]].join(" ")}
      data-status={service.status}
      onClick={() => void handleClick()}
      disabled={isDiagnosing}
      aria-label={variant === "compact" ? label : undefined}
      title={label}
    >
      <span className={styles.iconWrap} aria-hidden>
        {isDiagnosing ? <Spinner size="sm" label="" /> : <Activity />}
        <span className={styles.dot} />
      </span>
      {variant === "full" ? (
        <span className={styles.text}>{isDiagnosing ? "Verificando servidor…" : `Servidor ${STATUS_LABEL[service.status]}`}</span>
      ) : null}
    </button>
  );
}
