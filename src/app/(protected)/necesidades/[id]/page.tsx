"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Pencil, Sparkles, Trash2 } from "lucide-react";
import type { Need } from "@/apis/interfaces/needs";
import { AppShell, PageGrid } from "@/components/templates";
import { ArrowLink, Badge, Button, Card, Chip } from "@/components/atoms";
import { AnalyzingPanel, LoadingState, ScoreMeter } from "@/components/molecules";
import { NeedForm } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { useNeed } from "@/modules/needs/hooks/useNeed/useNeed";
import {
  NEED_KIND_LABEL,
  NEED_SCALE_LABEL,
  NEED_STATUS_VIEW,
  PRIORITY_VIEW,
  formatScore,
  isOpenNeed,
} from "@/modules/needs/utils/need-view";
import { formatDate } from "@/modules/projects/utils/project-view";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "../necesidades.module.css";

const EMPTY = "Sin definir";

function Breadcrumb({ title }: { title?: string }) {
  return (
    <>
      Necesidades <span className={styles.breadcrumbSep}>/</span>{" "}
      <span className={styles.breadcrumbCurrent}>{title ?? "Detalle"}</span>
    </>
  );
}

function Characterization({ need }: { need: Need }) {
  const { projectTypes } = useProjectTypesCatalog();
  const c = need.characterization;
  if (!c) {
    return (
      <Card padding={24}>
        <h2 className={styles.sectionTitle}>Caracterización</h2>
        <p className={styles.text}>
          Aún no se ha caracterizado. La IA extrae del texto el problema, el objetivo, los beneficiarios, los
          resultados esperados y las competencias del catálogo, y señala lo que falta.
        </p>
      </Card>
    );
  }
  const suggestedType = projectTypes.find((type) => type.code === c.suggestedProjectTypeCode);
  return (
    <Card padding={24}>
      <h2 className={styles.sectionTitle}>Caracterización con IA</h2>
      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt>Problema</dt>
          <dd>{c.problem || EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Objetivo</dt>
          <dd>{c.objective || EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Beneficiarios</dt>
          <dd>{c.beneficiaries || EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Tipo de proyecto sugerido</dt>
          <dd>{suggestedType?.name ?? c.suggestedProjectTypeCode ?? EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Resultados esperados</dt>
          <dd>
            {c.expectedResults.length > 0 ? (
              <ul className={styles.list}>
                {c.expectedResults.map((result) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
            ) : (
              EMPTY
            )}
          </dd>
        </div>
        <div className={styles.field}>
          <dt>Competencias del catálogo</dt>
          <dd>
            {c.competencies.length > 0 ? (
              <span className={styles.chips}>
                {c.competencies.map((competency) => (
                  <Chip key={competency.skillId} tone="red">
                    {competency.name}
                  </Chip>
                ))}
                {c.unmatchedCompetencies.map((name) => (
                  <Chip key={name} title="No está en el catálogo">
                    {name}
                  </Chip>
                ))}
              </span>
            ) : (
              EMPTY
            )}
          </dd>
        </div>
      </dl>
      {c.missingInformation.length > 0 ? (
        <>
          <h3 className={styles.sectionTitle}>Información que falta según la IA</h3>
          <ul className={styles.list}>
            {c.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      <p className={styles.note}>
        Caracterizada el {formatDate(need.characterizedAt)} con {c.provider} ({c.model}, prompt {c.promptVersion}). La IA
        sugiere; tú decides.
      </p>
    </Card>
  );
}

function Scores({ need }: { need: Need }) {
  return (
    <Card padding={20}>
      <h2 className={styles.sectionTitle}>Prioridad y completitud</h2>
      <div className={styles.meters}>
        <ScoreMeter label="Prioridad" value={need.priorityScore} valueText={formatScore(need.priorityScore)} />
        <Badge tone={PRIORITY_VIEW[need.priorityLevel].tone} dot>
          {PRIORITY_VIEW[need.priorityLevel].label}
        </Badge>
        <ScoreMeter label="Completitud" value={need.completeness} />
      </div>
      {need.missingElements.length > 0 ? (
        <>
          <p className={styles.note}>Le falta (peso en la completitud):</p>
          <ul className={styles.missing}>
            {need.missingElements.map((item) => (
              <li key={item.element}>
                <span>{item.label}</span>
                <span className={styles.weight}>{item.weight} %</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={styles.note}>Tiene todos los elementos de una necesidad bien caracterizada.</p>
      )}
      <p className={styles.note}>Prioridad = 40 % impacto + 40 % urgencia + 20 % completitud.</p>
    </Card>
  );
}

export default function NecesidadDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { need, isLoading, error, characterize, isCharacterizing, update, discard } = useNeed(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading || !need) {
    return (
      <AppShell breadcrumb={<Breadcrumb />}>
        <PageGrid>
          {isLoading ? (
            <LoadingState variant="page" message="Cargando necesidad…" />
          ) : (
            <Card padding={24}>
              <p className={styles.text}>{error || "No se encontró la necesidad."}</p>
              <ArrowLink href="/necesidades">Volver a necesidades</ArrowLink>
            </Card>
          )}
        </PageGrid>
      </AppShell>
    );
  }

  const isOwner = user?.role === "LIDER" && need.createdById === user.id;
  const canAct = isOwner && isOpenNeed(need.status);
  const status = NEED_STATUS_VIEW[need.status];

  const runCharacterization = async () => {
    try {
      const result = await characterize();
      void notify.success(
        `La IA caracterizó la necesidad: completitud ${result.completeness} % y prioridad ${formatScore(result.priorityScore)}.`,
        { title: "Necesidad caracterizada" },
      );
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo caracterizar la necesidad."));
    }
  };

  const runDiscard = async () => {
    const confirmed = await notify.confirm({
      title: "¿Descartar la necesidad?",
      message: `"${need.title}" quedará como descartada y ya no se podrá editar ni convertir en proyecto.`,
      confirmLabel: "Descartar",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await loading.run(discard(null), "Descartando necesidad…");
      void notify.success(`"${need.title}" quedó descartada.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo descartar la necesidad."));
    }
  };

  return (
    <AppShell breadcrumb={<Breadcrumb title={need.title} />}>
      <PageGrid
        aside={<Scores need={need} />}
        header={
          <div className={styles.head}>
            <div className={styles.headText}>
              <div className={styles.titleRow}>
                <h1 className={styles.h1}>{need.title}</h1>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className={styles.sub}>
                {NEED_KIND_LABEL[need.kind]} · registrada el {formatDate(need.createdAt)}
              </p>
            </div>
            {canAct && !isEditing ? (
              <div className={styles.headActions}>
                <Button variant="ghost" leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
                <Button variant="ghost" leftIcon={<Trash2 />} onClick={() => void runDiscard()}>
                  Descartar
                </Button>
                <Button
                  variant={need.characterization ? "ghost" : "primary"}
                  leftIcon={<Sparkles />}
                  onClick={() => void runCharacterization()}
                  disabled={isCharacterizing}
                >
                  {need.characterization ? "Volver a caracterizar" : "Caracterizar con IA"}
                </Button>
                <Button
                  leftIcon={<ArrowRight />}
                  onClick={() => router.push(`/necesidades/${need.id}/oportunidad`)}
                  disabled={isCharacterizing}
                >
                  Convertir en oportunidad
                </Button>
              </div>
            ) : null}
          </div>
        }
      >
        <div className={styles.stack}>
          {isCharacterizing ? (
            <Card padding={24}>
              <AnalyzingPanel title="Caracterizando la necesidad con IA…" />
            </Card>
          ) : null}
          {isEditing ? (
            <NeedForm
              initial={need}
              submitLabel="Guardar cambios"
              isSaving={isSaving}
              onCancel={() => setIsEditing(false)}
              onSubmit={async (payload) => {
                setIsSaving(true);
                try {
                  const saved = await loading.run(update(payload), "Guardando cambios…");
                  setIsEditing(false);
                  void notify.success(
                    saved.status === "REGISTRADA" && need.status === "CARACTERIZADA"
                      ? "Los cambios se guardaron. Como cambió el texto, vuelve a caracterizarla."
                      : "Los cambios se guardaron.",
                  );
                } catch (err) {
                  void notify.error(getErrorMessage(err, "No se pudieron guardar los cambios."));
                } finally {
                  setIsSaving(false);
                }
              }}
            />
          ) : (
            <Card padding={24}>
              <h2 className={styles.sectionTitle}>Descripción</h2>
              <p className={styles.text}>{need.description}</p>
              <dl className={styles.fields}>
                <div className={styles.field}>
                  <dt>Urgencia</dt>
                  <dd>{NEED_SCALE_LABEL[scaleKey(need.urgency)]}</dd>
                </div>
                <div className={styles.field}>
                  <dt>Impacto</dt>
                  <dd>{NEED_SCALE_LABEL[scaleKey(need.impact)]}</dd>
                </div>
                <div className={styles.field}>
                  <dt>Plazo esperado</dt>
                  <dd>{need.deadline ? formatDate(need.deadline) : EMPTY}</dd>
                </div>
                <div className={styles.field}>
                  <dt>Dependencia</dt>
                  <dd>{need.dependency ?? EMPTY}</dd>
                </div>
              </dl>
              {need.status === "DESCARTADA" && need.discardReason ? (
                <p className={styles.note}>Motivo del descarte: {need.discardReason}</p>
              ) : null}
              {need.projectId ? (
                <p className={styles.note}>
                  <ArrowLink href={`/proyectos/${need.projectId}`}>Ver la oportunidad (proyecto)</ArrowLink>
                </p>
              ) : null}
            </Card>
          )}
          <Characterization need={need} />
        </div>
      </PageGrid>
    </AppShell>
  );
}

const SCALE_KEYS = ["1", "2", "3", "4", "5"] as const;
/** 1–5 → clave de `NEED_SCALE_LABEL` (el backend valida el rango). */
function scaleKey(value: number): (typeof SCALE_KEYS)[number] {
  return SCALE_KEYS[Math.min(Math.max(value, 1), 5) - 1];
}
