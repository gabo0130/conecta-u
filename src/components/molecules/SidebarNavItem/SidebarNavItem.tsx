import { ReactNode } from "react";
import { ChevronRight, NavIcon, SidebarLabel } from "../../atoms";
import { dashboardTokens } from "../../dashboard-tokens";
import styles from "./SidebarNavItem.module.css";

type SidebarNavItemProps = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick: () => void;
};

export function SidebarNavItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
}: SidebarNavItemProps) {
  const className = [styles.item, active ? styles.itemActive : ""].filter(Boolean).join(" ");

  return (
    <button
      onClick={onClick}
      className={className}
    >
      <NavIcon active={active}>{icon}</NavIcon>
      <SidebarLabel tone={active ? "active" : "default"}>
        {label}
      </SidebarLabel>
      <span className={styles.meta}>
        {badge ? (
          <span className={styles.badge}>
            {badge}
          </span>
        ) : null}
        <ChevronRight color={active ? dashboardTokens.colorActiveText : dashboardTokens.colorTextMuted} />
      </span>
    </button>
  );
}
