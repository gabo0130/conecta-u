import { Briefcase } from "lucide-react";
import styles from "./ExperienceItem.module.css";

export type Experience = {
  title: string;
  meta: string;
};

type ExperienceItemProps = {
  experience: Experience;
};

export function ExperienceItem({ experience }: ExperienceItemProps) {
  return (
    <div className={styles.exp}>
      <span className={styles.icon}>
        <Briefcase size={20} />
      </span>
      <div>
        <div className={styles.title}>{experience.title}</div>
        <div className={styles.meta}>{experience.meta}</div>
      </div>
    </div>
  );
}
