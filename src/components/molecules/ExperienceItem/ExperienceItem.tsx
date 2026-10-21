import { Briefcase, Eye, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "../../atoms";
import styles from "./ExperienceItem.module.css";

export type Experience = {
  title: string;
  meta: string;
};

type ExperienceItemProps = {
  experience: Experience;
  /** Ver el detalle completo (descripción, tecnologías) en modo solo lectura. */
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ExperienceItem({ experience, onView, onEdit, onDelete }: ExperienceItemProps) {
  return (
    <div className={styles.exp}>
      <span className={styles.icon}>
        <Briefcase size={20} />
      </span>
      <div className={styles.text}>
        <div className={styles.title}>{experience.title}</div>
        <div className={styles.meta}>{experience.meta}</div>
      </div>
      {onView || onEdit || onDelete ? (
        <div className={styles.actions}>
          {onView ? (
            <IconButton variant="plain" size="sm" label="Ver experiencia" icon={<Eye />} onClick={onView} />
          ) : null}
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
