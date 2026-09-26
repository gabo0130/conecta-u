"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CheckCircle2, ServerCrash, X } from "lucide-react";
import {
  checkService,
  dismissRecovered,
  getServerServiceState,
  getServiceState,
  retryNow,
  subscribeServiceStatus,
} from "@/utils/service-status";
import { Button, IconButton, Spinner } from "../../atoms";
import styles from "./ServiceStatusHost.module.css";

const RECOVERED_VISIBLE_MS = 8000;

function formatElapsed(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Aviso global del estado del servidor. Al montarse (cada vez que alguien entra a la app, por
 * cualquier ruta) consulta /health; si tarda o falla, avisa que el servidor se está levantando y
 * reintenta solo. Se monta una sola vez, en el layout raíz.
 */
export function ServiceStatusHost() {
  const service = useSyncExternalStore(subscribeServiceStatus, getServiceState, getServerServiceState);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    checkService();
  }, []);

  // Reloj para el tiempo transcurrido mientras se espera al servidor.
  useEffect(() => {
    if (service.status !== "waking") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [service.status]);

  // El aviso de "servidor disponible" se oculta solo.
  useEffect(() => {
    if (service.status !== "online" || !service.recovered) return;
    const timer = setTimeout(dismissRecovered, RECOVERED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [service.status, service.recovered]);

  if (service.status === "waking") {
    return (
      <div className={styles.banner} data-tone="waking" role="status" aria-live="polite">
        <Spinner size="md" label="" />
        <div className={styles.body}>
          <p className={styles.title}>Estamos levantando el servidor</p>
          <p className={styles.text}>
            El servicio estaba en reposo y se está iniciando. Puede tardar hasta 5 minutos; seguimos intentando
            solos.
          </p>
          <p className={styles.meta}>
            Esperando {formatElapsed(now - (service.wakingSince ?? now))} · intento {Math.max(1, service.attempts)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={retryNow} className={styles.action}>
          Reintentar ahora
        </Button>
      </div>
    );
  }

  if (service.status === "offline") {
    return (
      <div className={styles.banner} data-tone="offline" role="alert">
        <span className={styles.icon} aria-hidden>
          <ServerCrash />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>No pudimos conectar con el servidor</p>
          <p className={styles.text}>
            Pasaron más de 6 minutos sin respuesta. Revisa tu conexión a internet o vuelve a intentarlo.
          </p>
        </div>
        <Button size="sm" onClick={retryNow} className={styles.action}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (service.status === "online" && service.recovered) {
    return (
      <div className={styles.banner} data-tone="online" role="status" aria-live="polite">
        <span className={styles.icon} aria-hidden>
          <CheckCircle2 />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>El servidor ya está disponible</p>
          <p className={styles.text}>Si algún dato no cargó mientras arrancaba, actualiza la página.</p>
        </div>
        <div className={styles.actions}>
          <Button size="sm" onClick={() => window.location.reload()}>
            Actualizar página
          </Button>
          <IconButton variant="plain" size="sm" label="Cerrar aviso" icon={<X />} onClick={dismissRecovered} />
        </div>
      </div>
    );
  }

  return null;
}
