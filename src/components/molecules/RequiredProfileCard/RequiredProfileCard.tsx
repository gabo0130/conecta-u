import { LucideIcon } from "lucide-react";
import { Badge, Card, Chip } from "../../atoms";
import styles from "./RequiredProfileCard.module.css";

export type RequiredProfile = {
  icon: LucideIcon;
  title: string;
  count: string;
  priority: "alta" | "media" | "baja";
  reason: string;
  skills: string[];
};

type RequiredProfileCardProps = {
  profile: RequiredProfile;
};

const PRIORITY_TONE: Record<RequiredProfile["priority"], "red" | "amber" | "gray"> = {
  alta: "red",
  media: "amber",
  baja: "gray",
};

export function RequiredProfileCard({ profile }: RequiredProfileCardProps) {
  const { icon: Icon, title, count, priority, reason, skills } = profile;

  return (
    <Card padding={22}>
      <div className={styles.cardTop}>
        <div className={styles.profile}>
          <span className={styles.profileIcon}>
            <Icon size={22} />
          </span>
          <div>
            <div className={styles.profileName}>{title}</div>
            <div className={styles.profileCount}>{count}</div>
          </div>
        </div>
        <Badge tone={PRIORITY_TONE[priority]}>Prioridad {priority}</Badge>
      </div>
      <p className={styles.reason}>{reason}</p>
      <div className={styles.skills}>
        {skills.map((skill) => (
          <Chip key={skill}>{skill}</Chip>
        ))}
      </div>
    </Card>
  );
}
