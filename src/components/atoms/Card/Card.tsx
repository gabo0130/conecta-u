import { CSSProperties, HTMLAttributes } from "react";
import styles from "./Card.module.css";

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
  /** Padding en px desde sm; en móvil se limita a 16px para no comer el ancho de la pantalla. */
  padding?: number;
};

export function Card({ padding = 22, className, children, ...props }: CardProps) {
  const cardClassName = [styles.card, className].filter(Boolean).join(" ");

  return (
    <div {...props} className={cardClassName} style={{ "--card-padding": `${padding}px` } as CSSProperties}>
      {children}
    </div>
  );
}
