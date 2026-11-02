import styles from "./ScoreMeter.module.css";

type ScoreMeterProps = {
  label: string;
  /** 0–100. */
  value: number;
  /** Texto que se ve junto a la barra; por defecto el valor con "%". */
  valueText?: string;
};

/** Barra horizontal de 0 a 100 (completitud, prioridad) con su etiqueta, accesible como `meter`. */
export function ScoreMeter({ label, value, valueText }: ScoreMeterProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const text = valueText ?? `${Math.round(clamped)} %`;
  return (
    <div className={styles.meter}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{text}</span>
      </div>
      <div
        className={styles.track}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-valuetext={text}
      >
        <div className={styles.fill} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
