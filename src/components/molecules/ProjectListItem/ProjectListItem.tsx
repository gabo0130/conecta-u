import Link from "next/link";
import { Badge, BadgeTone, Spinner } from "../../atoms";
import styles from "./ProjectListItem.module.css";

export type ProjectSummary = {
  code: string;
  name: string;
  meta: string;
  /** Tipo y categoría todavía cargando: spinner antes de `meta`. */
  isMetaLoading?: boolean;
  status: string;
  tone: BadgeTone;
  href: string;
};

type ProjectListItemProps = {
  project: ProjectSummary;
  bordered?: boolean;
};

export function ProjectListItem({ project, bordered = true }: ProjectListItemProps) {
  const rowClassName = [styles.row, bordered ? styles.rowBorder : ""].filter(Boolean).join(" ");

  return (
    <div className={rowClassName}>
      <div className={styles.code}>{project.code}</div>
      <div className={styles.main}>
        <div className={styles.name}>{project.name}</div>
        <div className={styles.meta}>
          {project.isMetaLoading ? <Spinner size="sm" label="Cargando tipo y categoría" /> : null}
          {project.meta}
        </div>
      </div>
      <Badge tone={project.tone}>{project.status}</Badge>
      <Link href={project.href} className={styles.link}>
        Abrir
      </Link>
    </div>
  );
}
