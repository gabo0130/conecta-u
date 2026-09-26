"use client";

import { ReactNode, useEffect, useState } from "react";
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
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!isNavOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsNavOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNavOpen]);

  return (
    <div className={styles.app}>
      <Sidebar footer={sidebarFooter} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className={styles.main}>
        <TopBar
          breadcrumb={breadcrumb}
          search={search}
          isMenuOpen={isNavOpen}
          onMenuClick={() => setIsNavOpen(true)}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
