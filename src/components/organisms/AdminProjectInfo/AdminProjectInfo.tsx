import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { AdminProject } from "@/apis/interfaces/admin";
import { formatDate } from "@/modules/projects/utils/project-view";
import { Badge, Card } from "../../atoms";
import styles from "./AdminProjectInfo.module.css";

type AdminProjectInfoProps = {
  project: AdminProject;
};

/** Datos del proyecto que solo ve el ADMIN: quién lo lidera, su cuenta y su perfil técnico. */
export function AdminProjectInfo({ project }: AdminProjectInfoProps) {
  const { leader } = project;

  return (
    <Card padding={20} className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Información para administración</h2>
        <span className={styles.only}>
          <ShieldCheck size={14} aria-hidden />
          Solo administrador
        </span>
      </div>

      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt>Líder del proyecto</dt>
          <dd>
            {leader ? (
              <>
                <span className={styles.strong}>{leader.fullName}</span>
                <span className={styles.muted}>{leader.email}</span>
              </>
            ) : (
              "La cuenta del líder ya no existe"
            )}
          </dd>
        </div>

        {leader ? (
          <div className={styles.field}>
            <dt>Cuenta del líder</dt>
            <dd>
              <Badge tone={leader.active ? "green" : "gray"} dot>
                {leader.active ? "Activa" : "Inactiva"}
              </Badge>
            </dd>
          </div>
        ) : null}

        <div className={styles.field}>
          <dt>Perfil técnico del líder</dt>
          <dd>
            {leader?.collaboratorId ? (
              <Link href={`/colaboradores/${leader.collaboratorId}`}>Ver perfil técnico</Link>
            ) : (
              <span className={styles.muted}>El líder no tiene perfil técnico.</span>
            )}
          </dd>
        </div>

        <div className={styles.field}>
          <dt>Colaboradores asociados</dt>
          <dd className={styles.muted}>
            Ninguno todavía. Se asocian desde las recomendaciones del análisis con IA (Iteración 2).
          </dd>
        </div>

        <div className={styles.field}>
          <dt>Registrado · actualizado</dt>
          <dd>
            {formatDate(project.createdAt)} · {formatDate(project.updatedAt)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
