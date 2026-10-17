import { Clock, Pencil, Sparkles, Trash2, UserRound, Users } from "lucide-react";
import type { RequiredProfile, RequiredProfileSkill } from "@/apis/interfaces/analysis";
import {
  IMPORTANCE_LABEL,
  PRIORITY_LABEL,
  PRIORITY_TONE,
  PROFILE_SOURCE_LABEL,
  formatQuantity,
} from "@/modules/analysis/utils/analysis-view";
import { LEVEL_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import { Badge, Button, Card, Chip } from "../../atoms";
import { SKILL_TYPE_TONE, groupBySoftSkill } from "../SkillPicker/skill-type";
import styles from "./RequiredProfileCard.module.css";

type RequiredProfileCardProps = {
  profile: RequiredProfile;
  /** Sin callbacks (ADMIN o solo lectura) no se muestran las acciones. */
  onEdit?: () => void;
  onDiscard?: () => void;
};

function SkillChip({ skill }: { skill: RequiredProfileSkill }) {
  const level = LEVEL_LABEL[skill.minLevel];
  const importance = IMPORTANCE_LABEL[skill.importance].toLowerCase();
  return (
    <Chip
      tone={skill.catalogued ? SKILL_TYPE_TONE[skill.type] : "neutral"}
      className={[styles.skill, !skill.catalogued && styles.uncatalogued].filter(Boolean).join(" ")}
      aria-label={`${skill.name}: nivel mínimo ${level}, ${importance}${skill.catalogued ? "" : ", no catalogada"}`}
    >
      <span className={styles.skillName}>{skill.name}</span>
      <span className={styles.skillMeta} aria-hidden>
        {level} · {PRIORITY_LABEL[skill.importance]}
        {skill.catalogued ? null : " · no catalogada"}
      </span>
    </Chip>
  );
}

function SkillGroup({ title, skills }: { title: string; skills: RequiredProfileSkill[] }) {
  if (skills.length === 0) return null;
  return (
    <div className={styles.group}>
      <h4 className={styles.groupTitle}>{title}</h4>
      <ul className={styles.skills} aria-label={title}>
        {skills.map((skill) => (
          <li key={skill.id}>
            <SkillChip skill={skill} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Perfil requerido por un proyecto (RF13) con su justificación (RF14). */
export function RequiredProfileCard({ profile, onEdit, onDiscard }: RequiredProfileCardProps) {
  const { technical, soft } = groupBySoftSkill(profile.skills, (skill) => skill.type);
  const isAi = profile.source === "IA";
  const titleId = `perfil-${profile.id}`;

  return (
    <Card padding={22} className={styles.card}>
      <article aria-labelledby={titleId} className={styles.article}>
        <header className={styles.top}>
          <span className={styles.icon} aria-hidden>
            <UserRound size={22} />
          </span>
          <div className={styles.titleBox}>
            <h3 id={titleId} className={styles.name}>
              {profile.name}
            </h3>
            <p className={styles.meta}>
              <span>
                <Users size={14} aria-hidden /> {formatQuantity(profile.quantity)}
              </span>
              {profile.minWeeklyHours ? (
                <span>
                  <Clock size={14} aria-hidden /> Mínimo {profile.minWeeklyHours} h/semana
                </span>
              ) : null}
            </p>
          </div>
          <div className={styles.badges}>
            <Badge tone={PRIORITY_TONE[profile.priority]}>
              Prioridad {PRIORITY_LABEL[profile.priority].toLowerCase()}
            </Badge>
            <span className={[styles.source, isAi && styles.sourceAi].filter(Boolean).join(" ")}>
              {isAi ? <Sparkles size={13} aria-hidden /> : null}
              {PROFILE_SOURCE_LABEL[profile.source]}
            </span>
          </div>
        </header>

        {profile.description ? <p className={styles.description}>{profile.description}</p> : null}

        <section className={styles.justification} aria-label="Justificación">
          <h4 className={styles.justificationTitle}>¿Por qué este perfil?</h4>
          <p className={styles.justificationText}>{profile.justification || "Sin justificación registrada."}</p>
        </section>

        <SkillGroup title="Conocimientos y competencias" skills={technical} />
        <SkillGroup title="Habilidades blandas" skills={soft} />

        {onEdit || onDiscard ? (
          <footer className={styles.actions}>
            {onEdit ? (
              <Button
                variant="link"
                size="sm"
                leftIcon={<Pencil size={15} />}
                onClick={onEdit}
                aria-label={`Editar ${profile.name}`}
              >
                Editar
              </Button>
            ) : null}
            {onDiscard ? (
              <Button
                variant="link"
                size="sm"
                className={styles.discard}
                leftIcon={<Trash2 size={15} />}
                onClick={onDiscard}
                aria-label={`Descartar ${profile.name}`}
              >
                Descartar
              </Button>
            ) : null}
          </footer>
        ) : null}
      </article>
    </Card>
  );
}
