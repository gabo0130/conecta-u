"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../../atoms";
import styles from "./AnalyzingPanel.module.css";

/** Estado de "analizando con IA": la petición puede durar hasta un minuto, se muestra el tiempo que lleva. */
export function AnalyzingPanel() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.panel} role="status" aria-live="polite">
      <Spinner size="lg" label="" />
      <div className={styles.text}>
        <p className={styles.title}>Analizando el proyecto con IA…</p>
        <p className={styles.sub}>
          Puede tardar hasta un minuto. No cierres ni recargues esta página.
          <span className={styles.elapsed}> Llevamos {seconds} s.</span>
        </p>
      </div>
    </div>
  );
}
