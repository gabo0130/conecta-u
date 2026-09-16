import { HTMLAttributes } from "react";
import styles from "./Card.module.css";

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
  padding?: number;
};

export function Card({ padding = 22, className, children, ...props }: CardProps) {
  const cardClassName = [styles.card, className].filter(Boolean).join(" ");

  return (
    <div {...props} className={cardClassName} style={{ padding }}>
      {children}
    </div>
  );
}
