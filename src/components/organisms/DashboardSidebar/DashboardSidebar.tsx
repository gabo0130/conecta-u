"use client";

import { JSX, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Settings,
  SquareStack,
} from "lucide-react";
import {
  SearchBar,
  SidebarDivider,
} from "../../atoms";
import { DashboardNavId } from "../../dashboard-tokens";
import { dashboardTokens } from "../../dashboard-tokens";
import {
  SidebarNavGroup,
  SidebarNavItem,
  SidebarUserProfile,
} from "../../molecules";
import styles from "./DashboardSidebar.module.css";

type DashboardSidebarProps = {
  activeItem: DashboardNavId;
  onNavigate: (item: DashboardNavId) => void;
  items?: SidebarItem[];
  profileName?: string;
  profileRole?: string;
};

type SidebarItem = {
  id: DashboardNavId;
  label: string;
  icon: (active: boolean) => JSX.Element;
  badge?: string;
};

const defaultSidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (active) => (
      <LayoutDashboard
        size={14}
        color={active ? dashboardTokens.colorAccent : dashboardTokens.colorText}
      />
    ),
  },
  {
    id: "section-two",
    label: "Sección 2",
    icon: (active) => (
      <SquareStack
        size={14}
        color={active ? dashboardTokens.colorAccent : dashboardTokens.colorText}
      />
    ),
  },
  {
    id: "settings",
    label: "Configuración",
    icon: (active) => (
      <Settings
        size={14}
        color={active ? dashboardTokens.colorAccent : dashboardTokens.colorText}
      />
    ),
  },
];

export function DashboardSidebar({
  activeItem,
  onNavigate,
  items,
  profileName = "Nombre de usuario",
  profileRole = "Rol del usuario",
}: DashboardSidebarProps) {
  const [search, setSearch] = useState("");
  const sidebarItems = items ?? defaultSidebarItems;

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return sidebarItems;
    }

    return sidebarItems.filter((item) =>
      item.label.toLowerCase().includes(normalized),
    );
  }, [search, sidebarItems]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.searchWrap}>
        <SearchBar
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pestaña..."
        />
      </div>

      <div className={styles.spacer} />
      <SidebarDivider />

      <div className={styles.navWrap}>
        <SidebarNavGroup label="Navegación">
          {filteredItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <SidebarNavItem
                key={item.id}
                icon={item.icon(isActive)}
                label={item.label}
                active={isActive}
                badge={item.badge}
                onClick={() => onNavigate(item.id)}
              />
            );
          })}
        </SidebarNavGroup>
      </div>

      <div className={styles.profileWrap}>
        <SidebarUserProfile
          name={profileName}
          role={profileRole}
        />
      </div>
    </aside>
  );
}
