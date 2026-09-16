import { ReactNode } from "react";
import styles from "./SidebarNavGroup.module.css";

type SidebarNavGroupProps = {
  label?: string;
  children: ReactNode;
};

export function SidebarNavGroup({ label, children }: SidebarNavGroupProps) {
  return (
    <section className={styles.group}>
      {label ? (
        <p className={styles.label}>
          {label}
        </p>
      ) : null}
      <div className={styles.items}>{children}</div>
    </section>
  );
}
