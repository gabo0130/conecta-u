import { ReactNode } from "react";
import styles from "./SidebarLabel.module.css";

type SidebarLabelProps = {
  children: ReactNode;
  tone?: "default" | "active" | "inverse" | "muted";
};

export function SidebarLabel({ children, tone = "default" }: SidebarLabelProps) {
  const className = [styles.label, styles[tone]].filter(Boolean).join(" ");

  return <span className={className}>{children}</span>;
}
