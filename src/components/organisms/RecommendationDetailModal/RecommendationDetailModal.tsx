"use client";

import { CSSProperties } from "react";
import { RefreshCw } from "lucide-react";
import type { MatchBreakdown, RecommendationItem } from "@/apis/interfaces/recommendations";
import { IMPORTANCE_LABEL } from "@/modules/analysis/utils/analysis-view";
import { AVAILABILITY_VIEW, LEVEL_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import { useRecommendationDetail } from "@/modules/recommendations/hooks/useRecommendationDetail/useRecommendationDetail";
import {
  barWidth,
  componentContributions,
  formatMonths,
  formatPercent,
  formatScore,
} from "@/modules/recommendations/utils/recommendation-view";
import { Badge, Button, Modal } from "../../atoms";
import { LoadingState } from "../../molecules";
import styles from "./RecommendationDetailModal.module.css";

type RecommendationDetailModalProps = {
  projectId: string;
  recommendation: RecommendationItem;
  profileName: string;
  onClose: () => void;
};

/** "¿Por qué?" de una recomendación (RF17): de dónde sale cada punto del puntaje. */
export function RecommendationDetailModal({
  projectId,
  recommendation,
  profileName,
  onClose,
}: RecommendationDetailModalProps) {
  const { detail, isLoading, error, reload } = useRecommendationDetail(projectId, recommendation.id);

  return (
    <Modal title={`¿Por qué ${recommendation.collaborator.fullName}?`} onClose={onClose} width="wide">
      <p className={styles.lead}>
        Puntaje <strong>{formatScore(recommendation.score)} de 100</strong> para el perfil{" "}
        <strong>{profileName}</strong>.
      </p>

      {isLoading ? <LoadingState variant="section" message="Cargando el detalle…" /> : null}

      {!isLoading && error ? (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw />} onClick={() => void reload()}>
            Reintentar
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && detail ? (
        <div className={styles.sections}>
          <ScoreSection components={detail.components} weights={detail.breakdown.weights} />
          <SkillsSection breakdown={detail.breakdown} />
          <ExperienceSection experience={detail.breakdown.experience} />
          <AvailabilitySection availability={detail.breakdown.availability} />
          <SemanticSection similarity={detail.breakdown.semantic.similarity} />
        </div>
      ) : null}
    </Modal>
  );
}

function ScoreSection({
  components,
  weights,
}: {
  components: RecommendationItem["components"];
  weights: MatchBreakdown["weights"];
}) {
  const rows = componentContributions(components, weights);

  return (
    <section className={styles.section} aria-labelledby="calculo">
      <h4 id="calculo" className={styles.sectionTitle}>
        Cómo se calculó
      </h4>
      <ul className={styles.components}>
        {rows.map((row) => (
          <li key={row.key} className={styles.component}>
            <div className={styles.componentHead}>
              <span className={styles.componentLabel}>{row.label}</span>
              <span className={styles.componentPoints}>
                {row.weight === 0 ? "No se usó" : `+${row.points.toFixed(1)} pts`}
              </span>
            </div>
            <div className={styles.bar} aria-hidden>
              <span className={styles.fill} style={{ "--bar-width": barWidth(row.value * 100) } as CSSProperties} />
            </div>
            <p className={styles.componentMeta}>
              {formatPercent(row.value)} de cumplimiento · peso {formatPercent(row.weight)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SkillsSection({ breakdown }: { breakdown: MatchBreakdown }) {
  const { matchedSkills, missingSkills } = breakdown;

  return (
    <section className={styles.section} aria-labelledby="habilidades">
      <h4 id="habilidades" className={styles.sectionTitle}>
        Habilidades
      </h4>
      {matchedSkills.length === 0 ? (
        <p className={styles.muted}>No tiene ninguna de las habilidades del perfil.</p>
      ) : (
        <ul className={styles.list}>
          {matchedSkills.map((skill) => (
            <li key={skill.skill} className={styles.skill}>
              <div className={styles.skillHead}>
                <span className={styles.skillName}>{skill.skill}</span>
                <Badge tone="green">Coincide</Badge>
              </div>
              <p className={styles.skillMeta}>
                Pide {LEVEL_LABEL[skill.required]} · tiene {LEVEL_LABEL[skill.has]}
                {skill.months > 0 ? ` (${formatMonths(skill.months)})` : ""} · {IMPORTANCE_LABEL[skill.importance]} ·{" "}
                {formatPercent(skill.points)} de lo esperado
              </p>
            </li>
          ))}
        </ul>
      )}
      {missingSkills.length > 0 ? (
        <>
          <h5 className={styles.subTitle}>Le faltan</h5>
          <ul className={styles.list}>
            {missingSkills.map((skill) => (
              <li key={skill.skill} className={styles.skill}>
                <div className={styles.skillHead}>
                  <span className={styles.skillName}>{skill.skill}</span>
                  <Badge tone="gray">Falta</Badge>
                </div>
                <p className={styles.skillMeta}>
                  Pide {LEVEL_LABEL[skill.required]} · {IMPORTANCE_LABEL[skill.importance]}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function ExperienceSection({ experience }: { experience: MatchBreakdown["experience"] }) {
  return (
    <section className={styles.section} aria-labelledby="experiencia">
      <h4 id="experiencia" className={styles.sectionTitle}>
        Experiencia relevante
      </h4>
      {experience.items.length === 0 ? (
        <p className={styles.muted}>No registra experiencias con las tecnologías del perfil.</p>
      ) : (
        <>
          <p className={styles.text}>{formatMonths(experience.relevantMonths)} usando tecnologías del perfil.</p>
          <ul className={styles.bullets}>
            {experience.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function AvailabilitySection({ availability }: { availability: MatchBreakdown["availability"] }) {
  const view = AVAILABILITY_VIEW[availability.status];

  return (
    <section className={styles.section} aria-labelledby="disponibilidad">
      <h4 id="disponibilidad" className={styles.sectionTitle}>
        Disponibilidad
      </h4>
      <p className={styles.text}>
        <Badge tone={view.tone} dot>
          {view.label}
        </Badge>{" "}
        Ofrece {availability.weeklyHours} h/semana
        {availability.requiredHours !== null ? `; el perfil pide al menos ${availability.requiredHours}.` : "."}
      </p>
    </section>
  );
}

function SemanticSection({ similarity }: { similarity: number | null }) {
  return (
    <section className={styles.section} aria-labelledby="semantica">
      <h4 id="semantica" className={styles.sectionTitle}>
        Afinidad semántica
      </h4>
      <p className={similarity === null ? styles.muted : styles.text}>
        {similarity === null
          ? "No estuvo disponible para esta persona; su peso se repartió entre los demás criterios."
          : `Similitud ${similarity.toFixed(2)} entre la descripción del perfil y el perfil de la persona (de 0 a 1).`}
      </p>
    </section>
  );
}
