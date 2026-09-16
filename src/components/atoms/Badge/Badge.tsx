import { HTMLAttributes } from "react";
import styles from "./Badge.module.css";

export type BadgeTone = "green" | "amber" | "red" | "gray";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  dot?: boolean;
};

export function Badge({ tone = "gray", dot = false, className, children, ...props }: BadgeProps) {
  const badgeClassName = [styles.badge, styles[tone], className].filter(Boolean).join(" ");

  return (
    <span {...props} className={badgeClassName}>
      {dot ? <span className={styles.dot} /> : null}
      {children}
    </span>
  );
}
