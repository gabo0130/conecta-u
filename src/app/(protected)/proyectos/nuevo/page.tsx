"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageGrid } from "@/components/templates";
import { Card, Select } from "@/components/atoms";
import { ProjectForm, ProjectFormTips } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useLeaderOptions } from "@/modules/admin/hooks/useLeaderOptions/useLeaderOptions";
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
  const { user } = useAuth();
  const { createProject, isSaving } = useCreateProject();
  // v2.1 (A5): el ADMIN registra a nombre de un líder; el proyecto queda de ese líder.
  const isAdmin = user?.role === "ADMIN";
  const leaders = useLeaderOptions(isAdmin);
  const [leaderId, setLeaderId] = useState("");
  const [leaderError, setLeaderError] = useState("");

  return (
    <AppShell breadcrumb={breadcrumb}>
      <PageGrid
        aside={<ProjectFormTips />}
        header={
          <>
            <h1 className={styles.h1}>Registrar proyecto</h1>
            <p className={styles.sub}>
              {isAdmin
                ? "Registra el proyecto a nombre de un líder: quedará en su lista y solo él podrá editarlo."
                : "Elige el tipo y la categoría y completa su plantilla: resumen, objetivos, habilidades conocidas y entregables."}
            </p>
          </>
        }
      >
        <div className={styles.stack}>
          {isAdmin ? (
            <Card padding={20}>
              <Select
                label="Líder responsable"
                options={[
                  { value: "", label: leaders.isLoading ? "Cargando líderes…" : "Selecciona el líder" },
                  ...leaders.options,
                ]}
                value={leaderId}
                onChange={(event) => {
                  setLeaderId(event.target.value);
                  setLeaderError("");
                }}
                isLoading={leaders.isLoading}
                error={leaderError || leaders.error || undefined}
                helperText="Solo usuarios activos con rol Líder."
              />
            </Card>
          ) : null}
          <ProjectForm
            submitLabel="Guardar proyecto"
            isSaving={isSaving}
            onCancel={() => router.push("/proyectos")}
            onSubmit={async (payload) => {
              if (isAdmin && !leaderId) {
                setLeaderError("Elige el líder responsable del proyecto.");
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              try {
                const project = await loading.run(
                  createProject(isAdmin ? { ...payload, leaderId } : payload),
                  "Guardando proyecto…",
                );
                router.push(`/proyectos/${project.id}`);
                void notify.success(`"${project.title}" quedó registrado.`, { title: "Proyecto registrado" });
              } catch (err) {
                void notify.error(getErrorMessage(err, "No se pudo guardar el proyecto."));
              }
            }}
          />
        </div>
      </PageGrid>
    </AppShell>
  );
}
