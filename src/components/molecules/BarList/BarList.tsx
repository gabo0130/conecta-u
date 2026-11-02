import styles from "./BarList.module.css";

export type BarListItem = {
  key: string;
  label: string;
  value: number;
  /** Texto a la derecha (si no, el valor). */
  display?: string;
};

type BarListProps = {
  items: BarListItem[];
  /** Nombre de la serie para lectores de pantalla (p. ej. "Proyectos por tipo"). */
  label: string;
  emptyMessage?: string;
  tone?: "red" | "green" | "amber" | "info";
};

/**
 * Barras horizontales simples (RF15). Cada fila es texto real, no solo color: el valor se lee
 * aunque no se distinga la barra.
 */
export function BarList({ items, label, emptyMessage = "Sin datos todavía.", tone = "red" }: BarListProps) {
  if (items.length === 0) return <p className={styles.empty}>{emptyMessage}</p>;
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((item) => (
        <li key={item.key} className={styles.row}>
          <div className={styles.head}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.display ?? item.value}</span>
          </div>
          <div className={styles.track} aria-hidden>
            <div className={[styles.bar, styles[tone]].join(" ")} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
