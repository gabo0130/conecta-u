"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/templates";
import { Badge, Button, Card } from "@/components/atoms";
import { ProjectForm } from "@/components/organisms";
import { useProjectDetail } from "@/modules/projects/hooks/useProject/useProjectDetail";
import { useUpdateProject } from "@/modules/projects/hooks/useProject/useProject";
import { formatDate, getStatusView } from "@/modules/projects/utils/project-view";
import { getErrorMessage } from "@/utils/get-error-message";
import styles from "./detalle.module.css";

export default function ProyectoDetallePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { project, setProject, isLoading, error: loadError } = useProjectDetail(id);
  const { updateProject, isSaving } = useUpdateProject(id);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const breadcrumb = (
    <>
      Proyectos <span className={styles.breadcrumbSep}>/</span>{" "}
      <span className={styles.breadcrumbCurrent}>{project?.title ?? "Detalle"}</span>
    </>
  );

  if (isLoading) {
    return (
      <AppShell breadcrumb={breadcrumb}>
        <p className={styles.state}>Cargando proyecto…</p>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell breadcrumb={breadcrumb}>
        <Card padding={24}>
          <p className={styles.state}>{loadError || "No se encontró el proyecto."}</p>
          <div className={styles.content}>
            <Button variant="ghost" onClick={() => router.push("/proyectos")}>
              Volver a proyectos
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const status = getStatusView(project.status);

  return (
    <AppShell breadcrumb={breadcrumb}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{project.title}</h1>
          <p className={styles.sub}>Registrado el {formatDate(project.createdAt)}</p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className={styles.content}>
        {saved ? <div className={styles.success}>Cambios guardados.</div> : null}
        <ProjectForm
          initial={project}
          submitLabel="Guardar cambios"
          isSaving={isSaving}
          error={saveError}
          onCancel={() => router.push("/proyectos")}
          onSubmit={async (payload) => {
            setSaveError("");
            setSaved(false);
            try {
              setProject(await updateProject(payload));
              setSaved(true);
            } catch (err) {
              setSaveError(getErrorMessage(err, "No se pudieron guardar los cambios."));
            }
          }}
        />
      </div>
    </AppShell>
  );
}
