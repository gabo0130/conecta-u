import { LucideIcon } from "lucide-react";
import { Card, Spinner } from "../../atoms";
import styles from "./StatCard.module.css";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  hintTone?: "up" | "neutral";
  icon: LucideIcon;
  /** Mientras el dato llega del backend se muestra un spinner en lugar del valor. */
  isLoading?: boolean;
  /** La carga falló: se muestra "—" en vez de un valor que parecería real (p. ej. 0). */
  hasError?: boolean;
};

export function StatCard({
  label,
  value,
  hint,
  hintTone = "neutral",
  icon: Icon,
  isLoading = false,
  hasError = false,
}: StatCardProps) {
  const hintClassName = [styles.hint, hintTone === "up" ? styles.up : ""].filter(Boolean).join(" ");

  return (
    <Card padding={20}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon}>
          <Icon size={18} />
        </span>
      </div>
      <div className={styles.value}>
        {isLoading ? <Spinner size="lg" label={`Cargando ${label.toLowerCase()}`} /> : hasError ? "—" : value}
      </div>
      <div className={hintClassName}>{isLoading ? " " : hasError ? "No se pudo cargar" : hint}</div>
    </Card>
  );
}
