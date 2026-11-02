import { CSSProperties } from "react";
import { GraduationCap, HelpCircle, UserX } from "lucide-react";
import type { RecommendationItem } from "@/apis/interfaces/recommendations";
import { AVAILABILITY_VIEW, PERSON_TYPE_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import { barWidth, formatScore, scoreTone } from "@/modules/recommendations/utils/recommendation-view";
import { Badge, Button, Card, Checkbox } from "../../atoms";
import styles from "./RecommendationCard.module.css";

type RecommendationCardProps = {
  recommendation: RecommendationItem;
  onExplain: () => void;
  /** RF21: el líder marca a quién convocar por correo. */
  selection?: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean };
  /** RF22: ya se le envió una convocatoria (p. ej. "Convocada el 3 nov."). */
  invitedLabel?: string | null;
};

/** Una persona recomendada para un perfil (RF12): puesto, puntaje y datos sin contacto. */
export function RecommendationCard({ recommendation, onExplain, selection, invitedLabel }: RecommendationCardProps) {
  const { rank, score, matchedSkillCount, requiredSkillCount, collaborator } = recommendation;
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
          </div>
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
