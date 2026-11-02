"use client";

import { formatAcceptanceRate, formatDecisionCounts } from "@/modules/admin/utils/evaluation-view";
import { useEvaluationSummary } from "@/modules/admin/hooks/useEvaluationSummary/useEvaluationSummary";
import { Button, Card } from "../../atoms";
import { LoadingState, ScoreMeter } from "../../molecules";
import styles from "./EvaluationCard.module.css";

/** Tesis (D6): tasa de aceptación de las recomendaciones según las decisiones reales de los líderes. */
export function EvaluationCard() {
  const { summary, isLoading, error, reload } = useEvaluationSummary();

  return (
    <Card padding={20}>
      <h3 className={styles.title}>Evaluación del recomendador</h3>
      <p className={styles.subtitle}>
        Tasa de aceptación: personas recomendadas que los líderes aceptaron, sobre las que decidieron.
      </p>
      {isLoading ? <LoadingState message="Cargando evaluación…" /> : null}
      {!isLoading && error ? (
        <div className={styles.state}>
          <p>{error}</p>
          <Button variant="ghost" size="sm" onClick={() => void reload()}>
            Reintentar
          </Button>
        </div>
      ) : null}
      {!isLoading && !error && summary ? (
        summary.acceptance.decided === 0 ? (
          <p className={styles.state}>
            Aún no hay decisiones: aparecen cuando los líderes aceptan o descartan personas en las recomendaciones.
          </p>
        ) : (
          <>
            <div className={styles.global}>
              <span className={styles.rate}>{formatAcceptanceRate(summary.acceptance.acceptanceRate)}</span>
              <span className={styles.counts}>{formatDecisionCounts(summary.acceptance)}</span>
            </div>
            <ul className={styles.list} aria-label="Tasa de aceptación por proyecto">
              {summary.byProject.map((project) => (
                <li key={project.projectId}>
                  <ScoreMeter
                    label={`${project.projectTitle} (${formatDecisionCounts(project)})`}
                    value={(project.acceptanceRate ?? 0) * 100}
                    valueText={formatAcceptanceRate(project.acceptanceRate)}
                  />
                </li>
              ))}
            </ul>
          </>
        )
      ) : null}
    </Card>
  );
}
