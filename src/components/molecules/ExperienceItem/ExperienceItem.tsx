import { Briefcase, Pencil, Trash2 } from "lucide-react";
import styles from "./ExperienceItem.module.css";

export type Experience = {
  title: string;
  meta: string;
};

type ExperienceItemProps = {
  experience: Experience;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ExperienceItem({ experience, onEdit, onDelete }: ExperienceItemProps) {
  return (
    <div className={styles.exp}>
      <span className={styles.icon}>
        <Briefcase size={20} />
      </span>
      <div className={styles.text}>
        <div className={styles.title}>{experience.title}</div>
        <div className={styles.meta}>{experience.meta}</div>
      </div>
      {onEdit || onDelete ? (
        <div className={styles.actions}>
          {onEdit ? (
            <button type="button" className={styles.action} onClick={onEdit} aria-label="Editar experiencia">
              <Pencil size={16} />
            </button>
          ) : null}
          {onDelete ? (
            <button type="button" className={styles.action} onClick={onDelete} aria-label="Eliminar experiencia">
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
