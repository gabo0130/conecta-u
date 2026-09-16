import { Badge, BadgeTone } from "../../atoms";
import styles from "./ProjectListItem.module.css";

export type ProjectSummary = {
  code: string;
  name: string;
  meta: string;
  status: string;
  tone: BadgeTone;
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
        <div className={styles.meta}>{project.meta}</div>
      </div>
      <Badge tone={project.tone}>{project.status}</Badge>
      <a href="#" className={styles.link}>
        Abrir
      </a>
    </div>
  );
}
