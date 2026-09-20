"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AppShell } from "@/components/templates";
import { Card } from "@/components/atoms";
import { ProjectForm } from "@/components/organisms";
import { useCreateProject } from "@/modules/projects/hooks/useProject/useProject";
import { getErrorMessage } from "@/utils/get-error-message";
import styles from "./nuevo.module.css";

const TIPS = [
  "Sé específico en los objetivos.",
  "Incluye las tecnologías conocidas.",
  "Menciona si es interdisciplinario.",
];

const breadcrumb = (
  <>
    Proyectos <span className={styles.breadcrumbSep}>/</span>{" "}
    <span className={styles.breadcrumbCurrent}>Nuevo proyecto</span>
  </>
);

export default function NuevoProyectoPage() {
  const router = useRouter();
  const { createProject, isSaving } = useCreateProject();
  const [error, setError] = useState("");

  return (
    <AppShell breadcrumb={breadcrumb}>
      <div className={styles.layout}>
        <div className={styles.formCol}>
          <h1 className={styles.h1}>Registrar proyecto de investigación</h1>
          <p className={styles.sub}>
            Completa la plantilla con el resumen, los objetivos y las habilidades técnicas conocidas.
          </p>

          <div className={styles.form}>
            <ProjectForm
              submitLabel="Guardar proyecto"
              isSaving={isSaving}
              error={error}
              onCancel={() => router.push("/proyectos")}
              onSubmit={async (payload) => {
                setError("");
                try {
                  const project = await createProject(payload);
                  router.push(`/proyectos/${project.id}`);
                } catch (err) {
                  setError(getErrorMessage(err, "No se pudo guardar el proyecto."));
                }
              }}
            />
          </div>
        </div>

        <aside className={styles.helper}>
          <Card padding={20}>
            <h4 className={styles.tipsTitle}>Consejos</h4>
            <div className={styles.tips}>
              {TIPS.map((tip) => (
                <div key={tip} className={styles.tip}>
                  <Check size={17} className={styles.tipIcon} />
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
