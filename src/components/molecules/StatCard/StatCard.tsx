import { LucideIcon } from "lucide-react";
import { Card } from "../../atoms";
import styles from "./StatCard.module.css";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  hintTone?: "up" | "neutral";
  icon: LucideIcon;
};

export function StatCard({ label, value, hint, hintTone = "neutral", icon: Icon }: StatCardProps) {
  const hintClassName = [styles.hint, hintTone === "up" ? styles.up : ""].filter(Boolean).join(" ");

  return (
    <Card padding={20}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon}>
          <Icon size={18} />
        </span>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={hintClassName}>{hint}</div>
    </Card>
  );
}
