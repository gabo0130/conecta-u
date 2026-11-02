import { Eye } from "lucide-react";
import { Badge, IconButton } from "../../atoms";
import type { BadgeTone } from "../../atoms";
import { ScoreMeter } from "../ScoreMeter/ScoreMeter";
import styles from "./NeedListItem.module.css";

export type NeedRow = {
  title: string;
  meta: string;
  status: { label: string; tone: BadgeTone };
  priority: { label: string; tone: BadgeTone; score: string; value: number };
  completeness: number;
  href: string;
};

type NeedListItemProps = {
  need: NeedRow;
  bordered?: boolean;
};

/** Fila de la lista de necesidades: estado, prioridad y completitud a la vista. */
export function NeedListItem({ need, bordered = true }: NeedListItemProps) {
  const rowClassName = [styles.row, bordered ? styles.rowBorder : ""].filter(Boolean).join(" ");
  return (
    <div className={rowClassName}>
      <div className={styles.main}>
        <div className={styles.title}>{need.title}</div>
        <div className={styles.meta}>{need.meta}</div>
        <div className={styles.badges}>
          <Badge tone={need.status.tone}>{need.status.label}</Badge>
          <Badge tone={need.priority.tone} dot>
            {need.priority.label}
          </Badge>
        </div>
      </div>
      <div className={styles.scores}>
        <ScoreMeter label="Prioridad" value={need.priority.value} valueText={need.priority.score} />
        <ScoreMeter label="Completitud" value={need.completeness} />
      </div>
      <IconButton
        variant="plain"
        size="sm"
        icon={<Eye />}
        href={need.href}
        label={`Abrir ${need.title}`}
        tooltip="Abrir necesidad"
        tooltipAlign="end"
      />
    </div>
  );
}
