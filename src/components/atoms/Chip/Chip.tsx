import { HTMLAttributes } from "react";
import styles from "./Chip.module.css";

type ChipTone = "neutral" | "red";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ChipTone;
};

export function Chip({ tone = "neutral", className, children, ...props }: ChipProps) {
  const chipClassName = [styles.chip, styles[tone], className].filter(Boolean).join(" ");

  return (
    <span {...props} className={chipClassName}>
      {children}
    </span>
  );
}
