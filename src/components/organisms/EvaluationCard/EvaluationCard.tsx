"use client";

import type { AcceptanceCounts } from "@/apis/interfaces/admin";
import { useEvaluationSummary } from "@/modules/admin/hooks/useEvaluationSummary/useEvaluationSummary";
import { Button, Card } from "../../atoms";
import { LoadingState, ScoreMeter } from "../../molecules";
import styles from "./EvaluationCard.module.css";

/** 0,6667 → "66,7 %"; sin decisiones, "—". */
export function formatRate(rate: number | null): string {
  return rate === null ? "—" : `${(rate * 100).toLocaleString("es-CO", { maximumFractionDigits: 1 })} %`;
}

const plural = (count: number, singular: string, many: string) => `${count} ${count === 1 ? singular : many}`;

export const describe = (counts: AcceptanceCounts) =>
  `${plural(counts.accepted, "aceptada", "aceptadas")} · ${plural(counts.discarded, "descartada", "descartadas")}`;

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
              <span className={styles.rate}>{formatRate(summary.acceptance.acceptanceRate)}</span>
              <span className={styles.counts}>{describe(summary.acceptance)}</span>
            </div>
            <ul className={styles.list} aria-label="Tasa de aceptación por proyecto">
              {summary.byProject.map((project) => (
                <li key={project.projectId}>
                  <ScoreMeter
                    label={`${project.projectTitle} (${describe(project)})`}
                    value={(project.acceptanceRate ?? 0) * 100}
                    valueText={formatRate(project.acceptanceRate)}
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
