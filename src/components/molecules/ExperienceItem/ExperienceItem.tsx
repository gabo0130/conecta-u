import { Briefcase, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "../../atoms";
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
            <IconButton variant="plain" size="sm" label="Editar experiencia" icon={<Pencil />} onClick={onEdit} />
          ) : null}
          {onDelete ? (
            <IconButton
              variant="plain"
              size="sm"
              tone="danger"
              label="Eliminar experiencia"
              icon={<Trash2 />}
              onClick={onDelete}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
