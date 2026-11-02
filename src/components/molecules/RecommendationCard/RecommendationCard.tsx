import { CSSProperties } from "react";
import { Check, GraduationCap, HelpCircle, UserX, X } from "lucide-react";
import type { FeedbackDecision, RecommendationItem } from "@/apis/interfaces/recommendations";
import { AVAILABILITY_VIEW, PERSON_TYPE_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import { barWidth, DECISION_VIEW, formatScore, scoreTone } from "@/modules/recommendations/utils/recommendation-view";
import { Badge, Button, Card, Checkbox } from "../../atoms";
import styles from "./RecommendationCard.module.css";

type RecommendationCardProps = {
  recommendation: RecommendationItem;
  onExplain: () => void;
  /** RF21: el líder marca a quién convocar por correo. */
  selection?: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean };
  /** RF22: ya se le envió una convocatoria (p. ej. "Convocada el 3 nov."). */
  invitedLabel?: string | null;
  /** Tesis (T7): solo el líder dueño decide; sin esto la decisión se muestra en solo lectura. */
  onDecide?: (decision: FeedbackDecision) => void;
  isDeciding?: boolean;
};


/** Una persona recomendada para un perfil (RF12): puesto, puntaje y datos sin contacto. */
export function RecommendationCard({
  recommendation,
  onExplain,
  selection,
  invitedLabel,
  onDecide,
  isDeciding = false,
}: RecommendationCardProps) {
  const { rank, score, matchedSkillCount, requiredSkillCount, collaborator, feedback } = recommendation;
  const decision = feedback?.decision ?? null;
  const availability = AVAILABILITY_VIEW[collaborator.availabilityStatus];
  const tone = scoreTone(score);
  const scoreLabel = `Puntaje ${formatScore(score)} de 100`;

  return (
    <Card padding={18} className={styles.card}>
      <article className={styles.article} aria-label={`${rank}. ${collaborator.fullName}`}>
        <span className={styles.rank} aria-hidden>
          {rank}
        </span>

        <div className={styles.main}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{collaborator.fullName}</h3>
            <span className={styles.personType}>{PERSON_TYPE_LABEL[collaborator.personType]}</span>
          </div>
          <p className={styles.meta}>
            <span>
              <GraduationCap size={14} aria-hidden />
              {collaborator.programName}
            </span>
            {collaborator.researchGroup ? <span>{collaborator.researchGroup}</span> : null}
          </p>
          <div className={styles.badges}>
            <Badge tone={availability.tone} dot>
              {availability.label} · {collaborator.weeklyHours} h/semana
            </Badge>
            {!collaborator.hasUser ? (
              <Badge tone="gray">
                <UserX size={12} aria-hidden /> Sin cuenta
              </Badge>
            ) : null}
            <span className={styles.skills}>
              {matchedSkillCount} de {requiredSkillCount} habilidades
            </span>
            {invitedLabel ? <Badge tone="green">{invitedLabel}</Badge> : null}
            {decision ? <Badge tone={DECISION_VIEW[decision].tone}>{DECISION_VIEW[decision].label}</Badge> : null}
          </div>
          {onDecide ? (
            <div className={styles.decision} role="group" aria-label={`Decisión sobre ${collaborator.fullName}`}>
              <Button
                variant={decision === "ACEPTADA" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<Check />}
                aria-pressed={decision === "ACEPTADA"}
                disabled={isDeciding || decision === "ACEPTADA"}
                onClick={() => onDecide("ACEPTADA")}
              >
                Aceptar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X />}
                aria-pressed={decision === "DESCARTADA"}
                disabled={isDeciding || decision === "DESCARTADA"}
                onClick={() => onDecide("DESCARTADA")}
              >
                Descartar
              </Button>
            </div>
          ) : null}
          {selection ? (
            <Checkbox
              size="sm"
              label="Convocar por correo"
              checked={selection.checked}
              disabled={selection.disabled}
              onChange={(event) => selection.onChange(event.target.checked)}
              aria-label={`Convocar a ${collaborator.fullName} por correo`}
            />
          ) : null}
        </div>

        <div className={styles.aside}>
          <div className={styles.scoreBox}>
            <span className={[styles.score, styles[tone]].join(" ")}>{formatScore(score)}</span>
            <span className={styles.scoreUnit}>/ 100</span>
          </div>
          <div
            className={styles.bar}
            role="meter"
            aria-label={scoreLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(score)}
          >
            <span
              className={[styles.fill, styles[tone]].join(" ")}
              style={{ "--bar-width": barWidth(score) } as CSSProperties}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<HelpCircle />}
            onClick={onExplain}
            aria-label={`¿Por qué se recomienda a ${collaborator.fullName}?`}
          >
            ¿Por qué?
          </Button>
        </div>
      </article>
    </Card>
  );
}
