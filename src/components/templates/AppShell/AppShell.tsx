import { ReactNode } from "react";
import { Sidebar, TopBar } from "../../organisms";
import styles from "./AppShell.module.css";

type AppShellProps = {
  breadcrumb?: ReactNode;
  searchPlaceholder?: string;
  sidebarFooter?: ReactNode;
  children: ReactNode;
};

export function AppShell({ breadcrumb, searchPlaceholder, sidebarFooter, children }: AppShellProps) {
  return (
    <div className={styles.app}>
      <Sidebar footer={sidebarFooter} />
      <div className={styles.main}>
        <TopBar breadcrumb={breadcrumb} searchPlaceholder={searchPlaceholder} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
