"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../../atoms";
import styles from "./AnalyzingPanel.module.css";

type AnalyzingPanelProps = {
  /** Cuándo empezó el análisis (ms): al retomarlo, el contador sigue desde ahí. */
  since?: number;
};

const elapsedSeconds = (since: number) => Math.max(0, Math.floor((Date.now() - since) / 1000));

/**
 * Estado de "analizando con IA". El análisis corre en el servidor: se puede salir de la página
 * y al volver se retoma. Se muestra el tiempo que lleva.
 */
export function AnalyzingPanel({ since }: AnalyzingPanelProps) {
  const [start] = useState(() => since ?? Date.now());
  const [seconds, setSeconds] = useState(() => elapsedSeconds(start));

  useEffect(() => {
    const interval = setInterval(() => setSeconds(elapsedSeconds(start)), 1000);
    return () => clearInterval(interval);
  }, [start]);

  return (
    <div className={styles.panel} role="status" aria-live="polite">
      <Spinner size="lg" label="" />
      <div className={styles.text}>
        <p className={styles.title}>Analizando el proyecto con IA…</p>
        <p className={styles.sub}>
          Suele tardar menos de un minuto. Puedes salir de esta página: el análisis sigue y lo verás al volver.
          <span className={styles.elapsed}> Llevamos {seconds} s.</span>
        </p>
      </div>
    </div>
  );
}
