"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell, PageGrid } from "@/components/templates";
import { ArrowLink, Card } from "@/components/atoms";
import { LoadingState } from "@/components/molecules";
import { ProjectForm, ProjectFormTips } from "@/components/organisms";
import { useOpportunityDraft } from "@/modules/needs/hooks/useOpportunityDraft/useOpportunityDraft";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "../../necesidades.module.css";

const breadcrumb = (
  <>
    Necesidades <span className={styles.breadcrumbSep}>/</span>{" "}
    <span className={styles.breadcrumbCurrent}>Convertir en oportunidad</span>
  </>
);

/** Tesis (T5): el formulario de proyecto llega precargado desde la caracterización de la necesidad. */
export default function ConvertirNecesidadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { draft, isLoading, error, convert, isSaving } = useOpportunityDraft(id);

  return (
    <AppShell breadcrumb={breadcrumb}>
      <PageGrid
        aside={<ProjectFormTips />}
        header={
          <>
            <h1 className={styles.h1}>Convertir en oportunidad</h1>
            <p className={styles.sub}>
              Revisa el proyecto que se armó con la caracterización, completa lo que falte y guárdalo. Seguirá el flujo
              normal: análisis con IA y recomendación de personas.
            </p>
          </>
        }
      >
        {isLoading ? <LoadingState variant="page" message="Preparando el proyecto…" /> : null}
        {!isLoading && (error || !draft) ? (
          <Card padding={24}>
            <p className={styles.text}>{error || "No se pudo preparar el proyecto."}</p>
            <ArrowLink href={`/necesidades/${id}`}>Volver a la necesidad</ArrowLink>
          </Card>
        ) : null}
        {!isLoading && draft ? (
          <ProjectForm
            defaults={draft}
            submitLabel="Crear proyecto"
            isSaving={isSaving}
            onCancel={() => router.push(`/necesidades/${id}`)}
            onSubmit={async (payload) => {
              try {
                const { project } = await loading.run(convert(payload), "Creando el proyecto…");
                router.push(`/proyectos/${project.id}`);
                void notify.success(`"${project.title}" quedó registrado a partir de la necesidad.`, {
                  title: "Oportunidad creada",
                });
              } catch (err) {
                void notify.error(getErrorMessage(err, "No se pudo crear el proyecto desde la necesidad."));
              }
            }}
          />
        ) : null}
      </PageGrid>
    </AppShell>
  );
}
