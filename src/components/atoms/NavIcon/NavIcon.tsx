import { ReactNode } from "react";
import styles from "./NavIcon.module.css";

type NavIconProps = {
  children: ReactNode;
  active?: boolean;
};

export function NavIcon({ children, active = false }: NavIconProps) {
  const className = [styles.icon, active ? styles.active : ""].filter(Boolean).join(" ");

  return (
    <span className={className}>
      {children}
    </span>
  );
}
