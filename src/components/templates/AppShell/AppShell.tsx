import { ReactNode } from "react";
import { Sidebar, TopBar } from "../../organisms";
import type { TopBarSearch } from "../../organisms/TopBar/TopBar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  breadcrumb?: ReactNode;
  search?: TopBarSearch;
  sidebarFooter?: ReactNode;
  children: ReactNode;
};

export function AppShell({ breadcrumb, search, sidebarFooter, children }: AppShellProps) {
  return (
    <div className={styles.app}>
      <Sidebar footer={sidebarFooter} />
      <div className={styles.main}>
        <TopBar breadcrumb={breadcrumb} search={search} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
