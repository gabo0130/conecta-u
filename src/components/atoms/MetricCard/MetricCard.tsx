import styles from "./MetricCard.module.css";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.label}>
        {label}
      </p>
      <p className={styles.value}>
        {value}
      </p>
      <p className={styles.detail}> 
        {detail}
      </p>
    </article>
  );
}
