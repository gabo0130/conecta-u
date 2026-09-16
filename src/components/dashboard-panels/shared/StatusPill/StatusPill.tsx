import styles from "./StatusPill.module.css";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  const className = [styles.pill, styles[tone]].join(" ");

  return <span className={className}>{label}</span>;
}
