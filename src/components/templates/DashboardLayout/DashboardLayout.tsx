import { ReactNode } from "react";
import { DashboardNavId } from "../../dashboard-tokens";
import { DashboardSidebar } from "../../organisms";
import styles from "./DashboardLayout.module.css";

type DashboardLayoutProps = {
  activeItem: DashboardNavId;
  onNavigate: (item: DashboardNavId) => void;
  children: ReactNode;
};

export function DashboardLayout({ activeItem, onNavigate, children }: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <DashboardSidebar activeItem={activeItem} onNavigate={onNavigate} />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
