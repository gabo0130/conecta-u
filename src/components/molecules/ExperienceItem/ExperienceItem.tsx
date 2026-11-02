import { Briefcase, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { Badge, IconButton } from "../../atoms";
import type { BadgeTone } from "../../atoms/Badge/Badge";
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
  /** RF4 (v2.2, E8): estado del certificado ("Certificado adjunto" / "Falta certificado"). */
  badge?: { label: string; tone: BadgeTone } | null;
  onViewCertificate?: () => void;
};

export function ExperienceItem({ experience, onView, onEdit, onDelete, badge, onViewCertificate }: ExperienceItemProps) {
  return (
    <div className={styles.exp}>
      <span className={styles.icon}>
        <Briefcase size={20} />
      </span>
      <div className={styles.text}>
        <div className={styles.title}>{experience.title}</div>
        <div className={styles.meta}>{experience.meta}</div>
        {badge ? (
          <Badge tone={badge.tone} className={styles.badge}>
            {badge.label}
          </Badge>
        ) : null}
      </div>
      {onView || onEdit || onDelete || onViewCertificate ? (
        <div className={styles.actions}>
          {onViewCertificate ? (
            <IconButton
              variant="plain"
              size="sm"
              label="Ver certificado"
              tooltip="Ver certificado"
              icon={<FileText />}
              onClick={onViewCertificate}
            />
          ) : null}
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
