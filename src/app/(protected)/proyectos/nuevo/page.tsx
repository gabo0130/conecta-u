"use client";

import { useRouter } from "next/navigation";
import { AppShell, PageGrid } from "@/components/templates";
import { ProjectForm, ProjectFormTips } from "@/components/organisms";
import { useCreateProject } from "@/modules/projects/hooks/useCreateProject/useCreateProject";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "./nuevo.module.css";

const breadcrumb = (
  <>
    Proyectos <span className={styles.breadcrumbSep}>/</span>{" "}
    <span className={styles.breadcrumbCurrent}>Nuevo proyecto</span>
  </>
);

export default function NuevoProyectoPage() {
  const router = useRouter();
  const { createProject, isSaving } = useCreateProject();

  return (
    <AppShell breadcrumb={breadcrumb}>
      <PageGrid
        aside={<ProjectFormTips />}
        header={
          <>
            <h1 className={styles.h1}>Registrar proyecto</h1>
            <p className={styles.sub}>
              Elige el tipo y la categoría y completa su plantilla: resumen, objetivos, habilidades conocidas y entregables.
            </p>
          </>
        }
      >
        <ProjectForm
          submitLabel="Guardar proyecto"
          isSaving={isSaving}
          onCancel={() => router.push("/proyectos")}
          onSubmit={async (payload) => {
            try {
              const project = await loading.run(createProject(payload), "Guardando proyecto…");
              router.push(`/proyectos/${project.id}`);
              void notify.success(`"${project.title}" quedó registrado.`, { title: "Proyecto registrado" });
            } catch (err) {
              void notify.error(getErrorMessage(err, "No se pudo guardar el proyecto."));
            }
          }}
        />
      </PageGrid>
    </AppShell>
  );
}
