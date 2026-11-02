"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Pencil, Sparkles, Trash2 } from "lucide-react";
import { AppShell, PageGrid, RolePage } from "@/components/templates";
import { ArrowLink, Badge, Button, Card } from "@/components/atoms";
import { AnalyzingPanel, LoadingState } from "@/components/molecules";
import { NeedForm, NeedScores, NeedView } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useNeed } from "@/modules/needs/hooks/useNeed/useNeed";
import {
  NEED_KIND_LABEL,
  NEED_STATUS_VIEW,
  formatPriorityScore,
  isOpenNeed,
} from "@/modules/needs/utils/need-view";
import { formatDate } from "@/modules/projects/utils/project-view";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "../necesidades.module.css";

function Breadcrumb({ title }: { title?: string }) {
  return (
    <>
      Necesidades <span className={styles.breadcrumbSep}>/</span>{" "}
      <span className={styles.breadcrumbCurrent}>{title ?? "Detalle"}</span>
    </>
  );
}

function NecesidadDetalleScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { need, isLoading, error, characterize, isCharacterizing, update, isSaving, discard } = useNeed(id);
  const [isEditing, setIsEditing] = useState(false);

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
        `La IA caracterizó la necesidad: completitud ${result.completeness} % y prioridad ${formatPriorityScore(result.priorityScore)}.`,
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
        aside={<NeedScores need={need} />}
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
                }
              }}
            />
          ) : (
            <NeedView need={need} />
          )}
        </div>
      </PageGrid>
    </AppShell>
  );
}

export default function NecesidadDetallePage() {
  return (
    <RolePage roles={["LIDER", "ADMIN"]}>
      <NecesidadDetalleScreen />
    </RolePage>
  );
}
