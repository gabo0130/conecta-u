import { Badge, BadgeTone, Button, Card, Chip, UserAvatar } from "../../atoms";
import styles from "./RecommendationCard.module.css";

export type CollaboratorRecommendation = {
  initials: string;
  name: string;
  role: string;
  availability: { label: string; tone: BadgeTone };
  meta: string;
  reasonPrefix: string;
  reasonHighlight: string;
  reasonSuffix: string;
  matchedSkills: string[];
  otherSkills: string[];
  affinityScore: number;
};

type RecommendationCardProps = {
  collaborator: CollaboratorRecommendation;
  onConvoke?: () => void;
};

export function RecommendationCard({ collaborator, onConvoke }: RecommendationCardProps) {
  const {
    initials,
    name,
    role,
    availability,
    meta,
    reasonPrefix,
    reasonHighlight,
    reasonSuffix,
    matchedSkills,
    otherSkills,
    affinityScore,
  } = collaborator;

  return (
    <Card padding={22} className={styles.person}>
      <UserAvatar initials={initials} alt={name} size={60} radius={16} />
      <div className={styles.main}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{name}</h3>
          <span className={styles.roleTag}>{role}</span>
          <Badge tone={availability.tone} dot>
            {availability.label}
          </Badge>
        </div>
        <div className={styles.meta}>{meta}</div>
        <p className={styles.reason}>
          {reasonPrefix}
          <b>{reasonHighlight}</b>
          {reasonSuffix}
        </p>
        <div className={styles.skills}>
          {matchedSkills.map((skill) => (
            <Chip key={skill} tone="red">
              {skill}
            </Chip>
          ))}
          {otherSkills.map((skill) => (
            <Chip key={skill}>{skill}</Chip>
          ))}
        </div>
      </div>
      <div className={styles.aside}>
        <div className={styles.scoreWrap}>
          <div className={styles.score}>{affinityScore}%</div>
          <div className={styles.scoreLabel}>afinidad</div>
        </div>
        <Button className={styles.convoke} onClick={onConvoke}>
          Convocar
        </Button>
        <a href="#" className={styles.viewLink}>
          Ver perfil
        </a>
      </div>
    </Card>
  );
}
