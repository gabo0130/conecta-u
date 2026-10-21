"use client";

import { useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Info, RefreshCw, Sparkles, Users } from "lucide-react";
import type { Project } from "@/apis/interfaces/projects";
import type { ProfileRecommendations, RecommendationItem } from "@/apis/interfaces/recommendations";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, Checkbox } from "@/components/atoms";
import { LoadingState, RecommendationCard } from "@/components/molecules";
import { RecommendationDetailModal, RoleGuard } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useAdminProject } from "@/modules/admin/hooks/useAdminProject/useAdminProject";
import { PRIORITY_LABEL, PRIORITY_TONE, formatQuantity } from "@/modules/analysis/utils/analysis-view";
import { useProjectDetail } from "@/modules/projects/hooks/useProjectDetail/useProjectDetail";
import { getStatusView } from "@/modules/projects/utils/project-view";
import { useRecommendations } from "@/modules/recommendations/hooks/useRecommendations/useRecommendations";
import { formatDate } from "@/utils/dates";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "./recomendaciones.module.css";

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
      <span className={styles.breadcrumbCurrent}>Recomendaciones</span>
    </>
  );
}

type Explaining = { recommendation: RecommendationItem; profileName: string };

type RecommendationsScreenProps = {
  project: Pick<Project, "id" | "title" | "status">;
  /** LIDER dueño: puede generar. ADMIN: solo lectura. */
  canGenerate: boolean;
};

/** Personas recomendadas por perfil requerido (RF15–RF17). */
function RecommendationsScreen({ project, canGenerate }: RecommendationsScreenProps) {
  const router = useRouter();
  const {
    profiles,
    generatedAt,
    isLoading,
    error,
    reload,
    includeUnavailable,
    setIncludeUnavailable,
    generate,
    isGenerating,
  } = useRecommendations(project.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [explaining, setExplaining] = useState<Explaining | null>(null);

  const status = getStatusView(project.status);
  const selected = profiles.find((profile) => profile.profileId === selectedId) ?? profiles[0];
  const hasGenerated = generatedAt !== null;
  const goToAnalysis = () => router.push(`/proyectos/${project.id}/analisis`);

  const handleGenerate = async () => {
    try {
      const result = await loading.run(generate(), "Generando recomendaciones…");
      const total = result.profiles.reduce((sum, profile) => sum + profile.recommendations.length, 0);
      const profileCount = result.profiles.length;
      void notify.success(
        total === 0
          ? "Se generaron las recomendaciones, pero por ahora nadie coincide con los perfiles."
          : `Se generaron ${total} recomendaciones para ${profileCount} perfil${profileCount === 1 ? "" : "es"}.`,
      );
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudieron generar las recomendaciones."));
    }
  };

  const generateButton = (
    <Button leftIcon={<Sparkles />} onClick={() => void handleGenerate()} disabled={isGenerating || isLoading}>
      {isGenerating ? "Generando…" : hasGenerated ? "Volver a generar" : "Generar recomendaciones"}
    </Button>
  );

  const header = (
    <div className={styles.head}>
      <div className={styles.headText}>
        <div className={styles.titleRow}>
          <h1 className={styles.h1}>{project.title}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className={styles.sub}>Personas recomendadas para cada perfil requerido y por qué.</p>
      </div>
      <div className={styles.headActions}>
        <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={goToAnalysis}>
          Volver al análisis
        </Button>
        {canGenerate && profiles.length > 0 ? generateButton : null}
      </div>
    </div>
  );

  return (
    <PageGrid width="wide" header={header}>
      <div className={styles.stack}>
        {isLoading && profiles.length === 0 ? <LoadingState message="Cargando recomendaciones…" /> : null}

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

        {!isLoading && !error && profiles.length === 0 ? (
          <NoProfiles analyzed={project.status === "ANALIZADO"} canGenerate={canGenerate} onGoToAnalysis={goToAnalysis} />
        ) : null}

        {!error && selected ? (
          <>
            <div className={styles.toolbar}>
              <Checkbox
                size="sm"
                label="Incluir no disponibles"
                checked={includeUnavailable}
                onChange={(event) => setIncludeUnavailable(event.target.checked)}
              />
              <p className={styles.generated}>
                {hasGenerated
                  ? `Generadas el ${formatDate(generatedAt, DATE_TIME)}`
                  : "Aún no se han generado recomendaciones."}
              </p>
            </div>

            {hasGenerated ? (
              <div className={styles.notice} role="note">
                <Info size={18} aria-hidden />
                <p>
                  Las recomendaciones no se recalculan solas: si se editan o descartan perfiles, o cambian los perfiles
                  de las personas, {canGenerate ? "vuelve a generarlas" : "el líder debe volver a generarlas"}.
                  {includeUnavailable
                    ? " Las personas no disponibles solo aparecen si la última generación también las incluyó."
                    : ""}
                </p>
              </div>
            ) : null}

            <div className={styles.profileTabs} role="group" aria-label="Perfil requerido">
              {profiles.map((profile) => (
                <button
                  key={profile.profileId}
                  type="button"
                  className={[styles.profileTab, profile === selected && styles.profileTabActive]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={profile === selected}
                  onClick={() => setSelectedId(profile.profileId)}
                >
                  <span className={styles.profileTabName}>{profile.name}</span>
                  <span className={styles.profileTabCount}>{profile.recommendations.length}</span>
                </button>
              ))}
            </div>

            <ProfileSection
              profile={selected}
              hasGenerated={hasGenerated}
              includeUnavailable={includeUnavailable}
              isLoading={isLoading}
              generateButton={canGenerate ? generateButton : null}
              onExplain={(recommendation) => setExplaining({ recommendation, profileName: selected.name })}
            />
          </>
        ) : null}
      </div>

      {explaining ? (
        <RecommendationDetailModal
          projectId={project.id}
          recommendation={explaining.recommendation}
          profileName={explaining.profileName}
          onClose={() => setExplaining(null)}
        />
      ) : null}
    </PageGrid>
  );
}

type ProfileSectionProps = {
  profile: ProfileRecommendations;
  hasGenerated: boolean;
  includeUnavailable: boolean;
  isLoading: boolean;
  /** Solo para el LIDER; el ADMIN ve el estado vacío sin acción. */
  generateButton: ReactNode;
  onExplain: (recommendation: RecommendationItem) => void;
};

function ProfileSection({
  profile,
  hasGenerated,
  includeUnavailable,
  isLoading,
  generateButton,
  onExplain,
}: ProfileSectionProps) {
  return (
    <section className={styles.profile} aria-labelledby="perfil-seleccionado">
      <div className={styles.profileHead}>
        <h2 id="perfil-seleccionado" className={styles.sectionTitle}>
          {profile.name}
        </h2>
        <Badge tone={PRIORITY_TONE[profile.priority]}>
          Prioridad {PRIORITY_LABEL[profile.priority].toLowerCase()}
        </Badge>
        <span className={styles.profileMeta}>
          {profile.source === "IA" ? "Propuesto por la IA" : "Agregado a mano"} · busca {formatQuantity(profile.quantity)}
        </span>
      </div>

      {isLoading ? <LoadingState message="Actualizando la lista…" /> : null}

      {!isLoading && !hasGenerated ? (
        <Card padding={24}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden>
              <Users size={26} />
            </span>
            <h3 className={styles.emptyTitle}>Aún no hay recomendaciones</h3>
            <p className={styles.emptyText}>
              {generateButton
                ? "Cada perfil se compara con las personas que dieron su consentimiento: habilidades, afinidad con la descripción, experiencia y disponibilidad."
                : "Cuando el líder las genere, aquí verás las personas más compatibles con cada perfil."}
            </p>
            {generateButton}
          </div>
        </Card>
      ) : null}

      {!isLoading && hasGenerated && profile.recommendations.length === 0 ? (
        <Card padding={24}>
          <p className={styles.state}>
            Nadie coincide con este perfil por ahora.
            {includeUnavailable || !generateButton
              ? ""
              : " Puedes incluir a las personas no disponibles y volver a generar."}
          </p>
        </Card>
      ) : null}

      {!isLoading && profile.recommendations.length > 0 ? (
        <ol className={styles.list}>
          {profile.recommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <RecommendationCard recommendation={recommendation} onExplain={() => onExplain(recommendation)} />
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

type NoProfilesProps = {
  analyzed: boolean;
  canGenerate: boolean;
  onGoToAnalysis: () => void;
};

function NoProfiles({ analyzed, canGenerate, onGoToAnalysis }: NoProfilesProps) {
  return (
    <Card padding={24}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden>
          <Sparkles size={26} />
        </span>
        <h2 className={styles.emptyTitle}>
          {analyzed ? "El proyecto no tiene perfiles activos" : "Primero hay que analizar el proyecto"}
        </h2>
        <p className={styles.emptyText}>
          {analyzed
            ? "Las recomendaciones se calculan para los perfiles requeridos. Agrega uno o vuelve a analizar el proyecto."
            : "Las recomendaciones se calculan a partir de los perfiles que propone el análisis con IA."}
        </p>
        <Button variant={canGenerate ? "primary" : "ghost"} leftIcon={<Sparkles />} onClick={onGoToAnalysis}>
          Ir al análisis
        </Button>
      </div>
    </Card>
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

function LeaderRecommendations({ id }: { id: string }) {
  const { project, isLoading, error } = useProjectDetail(id);
  if (isLoading || !project) return <ScreenState isLoading={isLoading} error={error} />;

  return (
    <AppShell breadcrumb={<Breadcrumb title={project.title} />}>
      <RecommendationsScreen project={project} canGenerate />
    </AppShell>
  );
}

function AdminRecommendations({ id }: { id: string }) {
  const { project, isLoading, error } = useAdminProject(id);
  if (isLoading || !project) return <ScreenState isLoading={isLoading} error={error} />;

  return (
    <AppShell breadcrumb={<Breadcrumb title={project.title} />}>
      <RecommendationsScreen project={project} canGenerate={false} />
    </AppShell>
  );
}

export default function ProyectoRecomendacionesPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (user?.role === "ADMIN") return <AdminRecommendations id={id} />;
  if (user?.role === "LIDER") return <LeaderRecommendations id={id} />;
  return (
    <AppShell breadcrumb={<Breadcrumb />}>
      <RoleGuard roles={["LIDER", "ADMIN"]}>{null}</RoleGuard>
    </AppShell>
  );
}
