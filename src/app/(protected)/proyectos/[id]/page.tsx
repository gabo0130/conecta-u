"use client";

import { ReactNode, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import type { Project } from "@/apis/interfaces/projects";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card } from "@/components/atoms";
import { LoadingState } from "@/components/molecules";
import { AdminProjectInfo, ProjectForm, ProjectFormTips, ProjectView } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useAdminProject } from "@/modules/admin/hooks/useAdminProject/useAdminProject";
import { useProjectDetail } from "@/modules/projects/hooks/useProjectDetail/useProjectDetail";
import { useUpdateProject } from "@/modules/projects/hooks/useUpdateProject/useUpdateProject";
import { formatDate, getStatusView } from "@/modules/projects/utils/project-view";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "./detalle.module.css";

function Breadcrumb({ title }: { title?: string }) {
  return (
    <>
      Proyectos <span className={styles.breadcrumbSep}>/</span>{" "}
      <span className={styles.breadcrumbCurrent}>{title ?? "Detalle"}</span>
    </>
  );
}

/** Estados de carga y "no encontrado", comunes a la vista del líder y del ADMIN. */
function DetailState({ isLoading, error }: { isLoading: boolean; error: string }) {
  const router = useRouter();

  return (
    <AppShell breadcrumb={<Breadcrumb />}>
      <PageGrid>
        {isLoading ? (
          <LoadingState variant="page" message="Cargando proyecto…" />
        ) : (
          <Card padding={24}>
            <p className={styles.state}>{error || "No se encontró el proyecto."}</p>
            <div className={styles.stateAction}>
              <Button variant="ghost" onClick={() => router.push("/proyectos")}>
                Volver a proyectos
              </Button>
            </div>
          </Card>
        )}
      </PageGrid>
    </AppShell>
  );
}

type DetailHeaderProps = {
  project: Project;
  subtitle: string;
  actions?: ReactNode;
};

function DetailHeader({ project, subtitle, actions }: DetailHeaderProps) {
  const status = getStatusView(project.status);

  return (
    <div className={styles.head}>
      <div className={styles.headText}>
        <div className={styles.titleRow}>
          <h1 className={styles.h1}>{project.title}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className={styles.sub}>{subtitle}</p>
      </div>
      {actions ? <div className={styles.headActions}>{actions}</div> : null}
    </div>
  );
}

function LeaderProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { project, setProject, isLoading, error } = useProjectDetail(id);
  const { updateProject, isSaving } = useUpdateProject(id);
  // Se abre en modo vista; los campos solo se pueden cambiar tras pulsar "Editar proyecto".
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading || !project) return <DetailState isLoading={isLoading} error={error} />;

  return (
    <AppShell breadcrumb={<Breadcrumb title={project.title} />}>
      {/* Vista: ancha para repartir las tarjetas en dos columnas desde xl.
          Edición: formulario + consejos en la columna lateral, igual que al crear. */}
      <PageGrid
        width="wide"
        aside={isEditing ? <ProjectFormTips /> : undefined}
        header={
          <DetailHeader
            project={project}
            subtitle={isEditing ? "Editando el proyecto" : `Registrado el ${formatDate(project.createdAt)}`}
            actions={
              !isEditing ? (
                <>
                  <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => router.push("/proyectos")}>
                    Volver
                  </Button>
                  <Button leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
                    Editar proyecto
                  </Button>
                </>
              ) : undefined
            }
          />
        }
      >
        {isEditing ? (
          <ProjectForm
            initial={project}
            submitLabel="Guardar cambios"
            isSaving={isSaving}
            onCancel={() => setIsEditing(false)}
            onSubmit={async (payload) => {
              try {
                setProject(await loading.run(updateProject(payload), "Guardando cambios…"));
                setIsEditing(false);
                void notify.success("Los cambios del proyecto se guardaron.");
              } catch (err) {
                void notify.error(getErrorMessage(err, "No se pudieron guardar los cambios."));
              }
            }}
          />
        ) : (
          <ProjectView project={project} />
        )}
      </PageGrid>
    </AppShell>
  );
}

/** ADMIN: cualquier proyecto en solo lectura, con la información de su líder. */
function AdminProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { project, isLoading, error } = useAdminProject(id);

  if (isLoading || !project) return <DetailState isLoading={isLoading} error={error} />;

  const leaderName = project.leader?.fullName ?? "cuenta eliminada";

  return (
    <AppShell breadcrumb={<Breadcrumb title={project.title} />}>
      <PageGrid
        width="wide"
        header={
          <DetailHeader
            project={project}
            subtitle={`Liderado por ${leaderName} · registrado el ${formatDate(project.createdAt)}`}
            actions={
              <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => router.push("/proyectos")}>
                Volver
              </Button>
            }
          />
        }
      >
        <ProjectView project={project} asideTop={<AdminProjectInfo project={project} />} />
      </PageGrid>
    </AppShell>
  );
}

export default function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  return user?.role === "ADMIN" ? <AdminProjectDetail id={id} /> : <LeaderProjectDetail id={id} />;
}
