"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Plus, RefreshCw, Sparkles } from "lucide-react";
import type { RequiredProfile } from "@/apis/interfaces/analysis";
import type { Project } from "@/apis/interfaces/projects";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card } from "@/components/atoms";
import { AnalysisHistoryList, AnalyzingPanel, LoadingState } from "@/components/molecules";
import { RequiredProfileCard, RequiredProfileModal, RoleGuard } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useAdminProject } from "@/modules/admin/hooks/useAdminProject/useAdminProject";
import { useAnalysisHistory } from "@/modules/analysis/hooks/useAnalysisHistory/useAnalysisHistory";
import { useProjectAnalysis } from "@/modules/analysis/hooks/useProjectAnalysis/useProjectAnalysis";
import { useRequiredProfiles } from "@/modules/analysis/hooks/useRequiredProfiles/useRequiredProfiles";
import { useProjectDetail } from "@/modules/projects/hooks/useProjectDetail/useProjectDetail";
import { getStatusView } from "@/modules/projects/utils/project-view";
import { formatDate } from "@/utils/dates";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import styles from "./analisis.module.css";

const DATE_TIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function Breadcrumb({ title }: { title?: string }) {
  return (
    <>
      Proyectos <span className={styles.breadcrumbSep}>/</span>{" "}
      {title ? (
        <>
          <span className={styles.breadcrumbProject}>{title}</span> <span className={styles.breadcrumbSep}>/</span>{" "}
        </>
      ) : null}
      <span className={styles.breadcrumbCurrent}>Análisis con IA</span>
    </>
  );
}

type AnalysisScreenProps = {
  project: Pick<Project, "id" | "title" | "status">;
  /** LIDER dueño: puede analizar y gestionar perfiles. ADMIN: solo lectura. */
  canEdit: boolean;
  /** Vuelve a pedir el proyecto (su estado cambia al analizar: EN_ANALISIS → ANALIZADO o el anterior). */
  onRefreshProject: () => Promise<unknown>;
};

/** Análisis con IA de un proyecto (RF12–RF14): perfiles requeridos con su justificación. */
function AnalysisScreen({ project, canEdit, onRefreshProject }: AnalysisScreenProps) {
  const router = useRouter();
  const { analysis, isLoading, error, reload, analyze, isAnalyzing, analyzeState, analyzeError } = useProjectAnalysis(
    project.id,
  );
  const history = useAnalysisHistory(project.id);
  const refreshAnalysis = useCallback(() => reload({ silent: true }), [reload]);
  const { createProfile, updateProfile, discardProfile } = useRequiredProfiles(project.id, refreshAnalysis);
  // `undefined`: cerrado; `null`: agregar uno nuevo; un perfil: editarlo.
  const [editing, setEditing] = useState<RequiredProfile | null | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Otro análisis está corriendo (otra pestaña u otra sesión): pedir uno nuevo solo daría 409.
  const isRunningElsewhere = project.status === "EN_ANALISIS" && !isAnalyzing;
  const canAnalyze = canEdit && !isRunningElsewhere;

  const status = getStatusView(project.status);
  const profiles = analysis?.profiles ?? [];
  const aiCount = profiles.filter((profile) => profile.source === "IA").length;
  const manualCount = profiles.length - aiCount;

  const handleAnalyze = async () => {
    const ok = await analyze();
    // También los fallidos quedan en el historial (status ERROR), y el estado del proyecto cambió.
    void history.reload();
    void onRefreshProject();
    if (ok) {
      void notify.success("El análisis terminó. Revisa los perfiles propuestos y su justificación.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([reload({ silent: true }), history.reload(), onRefreshProject()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDiscard = async (profile: RequiredProfile) => {
    const accepted = await notify.confirm({
      title: "¿Descartar perfil?",
      message: `"${profile.name}" dejará de aparecer en el análisis y no se usará para las recomendaciones.`,
      confirmLabel: "Descartar",
      tone: "danger",
    });
    if (!accepted) return;
    try {
      await discardProfile(profile.id);
      void notify.success(`El perfil "${profile.name}" se descartó.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo descartar el perfil."));
    }
  };

  const header = (
    <div className={styles.head}>
      <div className={styles.headText}>
        <div className={styles.titleRow}>
          <h1 className={styles.h1}>{project.title}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className={styles.sub}>Análisis con IA: perfiles que necesita el proyecto y por qué.</p>
      </div>
      <div className={styles.headActions}>
        <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => router.push(`/proyectos/${project.id}`)}>
          Volver al proyecto
        </Button>
        {analysis && canEdit ? (
          <Button leftIcon={<Plus />} onClick={() => setEditing(null)} disabled={isAnalyzing}>
            Agregar perfil
          </Button>
        ) : null}
      </div>
    </div>
  );

  const analyzeButton = (label: string) => (
    <Button leftIcon={<Sparkles />} onClick={() => void handleAnalyze()} disabled={isAnalyzing}>
      {isAnalyzing ? "Analizando…" : label}
    </Button>
  );

  return (
    <PageGrid
      width="wide"
      header={header}
      aside={
        analysis || history.analyses.length > 0 ? (
          <AnalysisHistoryList
            analyses={history.analyses}
            meta={history.meta}
            isLoading={history.isLoading}
            error={history.error}
            onPageChange={history.setPage}
          />
        ) : undefined
      }
    >
      <div className={styles.stack}>
        {isLoading ? <LoadingState message="Cargando el análisis…" /> : null}

        {!isLoading && error ? (
          <Card padding={24}>
            <p className={styles.state}>{error}</p>
            <div className={styles.stateAction}>
              <Button variant="ghost" leftIcon={<RefreshCw />} onClick={() => void reload()}>
                Reintentar
              </Button>
            </div>
          </Card>
        ) : null}

        {isRunningElsewhere ? (
          <div className={styles.notice} role="status">
            <RefreshCw size={18} aria-hidden />
            <p>Hay un análisis en curso para este proyecto. Actualiza en un momento para ver el resultado.</p>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw />}
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Actualizando…" : "Actualizar"}
            </Button>
          </div>
        ) : null}

        {isAnalyzing ? <AnalyzingPanel /> : null}

        {analyzeState === "error" ? (
          <div className={styles.errorBox} role="alert">
            <AlertCircle size={20} aria-hidden />
            <div className={styles.errorText}>
              <p className={styles.errorTitle}>No se pudo completar el análisis</p>
              <p>{analyzeError}</p>
            </div>
            {canAnalyze ? (
              <Button variant="ghost" size="sm" leftIcon={<RefreshCw />} onClick={() => void handleAnalyze()}>
                Reintentar
              </Button>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !error && !analysis && !isAnalyzing ? (
          <Card padding={24}>
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden>
                <Sparkles size={26} />
              </span>
              <h2 className={styles.emptyTitle}>Este proyecto aún no tiene un análisis</h2>
              {canEdit ? (
                <>
                  <p className={styles.emptyText}>
                    La IA lee el título, el resumen, los objetivos, las habilidades conocidas y los entregables, y
                    propone los perfiles que necesitas (técnicos y de habilidades blandas) con la justificación de cada
                    uno. Después puedes editarlos, descartarlos o agregar los tuyos.
                  </p>
                  {canAnalyze ? (
                    <>
                      {analyzeButton("Analizar con IA")}
                      <p className={styles.emptyHint}>Puede tardar hasta un minuto.</p>
                    </>
                  ) : null}
                </>
              ) : (
                <p className={styles.emptyText}>Cuando el líder lo analice, aquí verás los perfiles requeridos.</p>
              )}
            </div>
          </Card>
        ) : null}

        {analysis ? (
          <>
            <section className={styles.banner} aria-labelledby="resumen-analisis">
              <div className={styles.bannerPattern} />
              <span className={styles.bannerIcon} aria-hidden>
                <Sparkles size={26} />
              </span>
              <div className={styles.bannerText}>
                <h2 id="resumen-analisis" className={styles.bannerTitle}>
                  {aiCount === 1 ? "La IA identificó 1 perfil requerido" : `La IA identificó ${aiCount} perfiles requeridos`}
                  {manualCount > 0 ? ` · ${manualCount} agregado${manualCount === 1 ? "" : "s"} a mano` : ""}
                </h2>
                {analysis.summary ? <p className={styles.bannerSub}>{analysis.summary}</p> : null}
                <p className={styles.bannerMeta}>
                  {analysis.model} · {formatDate(analysis.completedAt ?? analysis.createdAt, DATE_TIME)}
                </p>
              </div>
              <Button
                variant="white"
                className={styles.bannerBtn}
                rightIcon={<ArrowRight size={17} />}
                onClick={() => router.push(`/proyectos/${project.id}/recomendaciones`)}
              >
                Ver recomendaciones
              </Button>
            </section>

            {analysis.outdated ? (
              <div className={styles.outdated} role="status">
                <AlertTriangle size={20} aria-hidden />
                <p>
                  <strong>El proyecto cambió desde el último análisis.</strong> Los perfiles pueden no reflejar los
                  cambios.
                </p>
                {canAnalyze ? analyzeButton("Volver a analizar") : null}
              </div>
            ) : null}

            <h2 className={styles.sectionTitle}>Perfiles requeridos</h2>
            {profiles.length === 0 ? (
              <Card padding={24}>
                <p className={styles.state}>
                  No hay perfiles activos.{canEdit ? " Agrega uno con “Agregar perfil” o vuelve a analizar el proyecto." : ""}
                </p>
              </Card>
            ) : (
              <div className={styles.grid}>
                {profiles.map((profile) => (
                  <RequiredProfileCard
                    key={profile.id}
                    profile={profile}
                    onEdit={canEdit && !isAnalyzing ? () => setEditing(profile) : undefined}
                    onDiscard={canEdit && !isAnalyzing ? () => void handleDiscard(profile) : undefined}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {editing !== undefined ? (
        <RequiredProfileModal
          profile={editing ?? undefined}
          onCreate={createProfile}
          onUpdate={(payload) => updateProfile(editing!.id, payload)}
          onClose={() => setEditing(undefined)}
        />
      ) : null}
    </PageGrid>
  );
}

function ScreenState({ isLoading, error }: { isLoading: boolean; error: string }) {
  return (
    <AppShell breadcrumb={<Breadcrumb />}>
      <PageGrid>
        {isLoading ? (
          <LoadingState variant="page" message="Cargando proyecto…" />
        ) : (
          <Card padding={24}>
            <p className={styles.state}>{error || "No se encontró el proyecto."}</p>
          </Card>
        )}
      </PageGrid>
    </AppShell>
  );
}

function LeaderAnalysis({ id }: { id: string }) {
  const { project, isLoading, error, reload } = useProjectDetail(id);
  if (isLoading || !project) return <ScreenState isLoading={isLoading} error={error} />;

  return (
    <AppShell breadcrumb={<Breadcrumb title={project.title} />}>
      <AnalysisScreen project={project} canEdit onRefreshProject={reload} />
    </AppShell>
  );
}

function AdminAnalysis({ id }: { id: string }) {
  const { project, isLoading, error, reload } = useAdminProject(id);
  if (isLoading || !project) return <ScreenState isLoading={isLoading} error={error} />;

  return (
    <AppShell breadcrumb={<Breadcrumb title={project.title} />}>
      <AnalysisScreen project={project} canEdit={false} onRefreshProject={reload} />
    </AppShell>
  );
}

export default function ProyectoAnalisisPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (user?.role === "ADMIN") return <AdminAnalysis id={id} />;
  if (user?.role === "LIDER") return <LeaderAnalysis id={id} />;
  return (
    <AppShell breadcrumb={<Breadcrumb />}>
      <RoleGuard roles={["LIDER", "ADMIN"]}>{null}</RoleGuard>
    </AppShell>
  );
}
