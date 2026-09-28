"use client";

import { Menu, Search } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { IconButton, UserAvatar } from "../../atoms";
import { ServiceStatusButton } from "../ServiceStatusButton/ServiceStatusButton";
import { ROLE_LABEL, getInitials } from "@/modules/collaborator/utils/collaborator-view";
import styles from "./TopBar.module.css";

export type TopBarSearch = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type TopBarProps = {
  search?: TopBarSearch;
  breadcrumb?: ReactNode;
  isMenuOpen?: boolean;
  onMenuClick?: () => void;
};

export function TopBar({ search, breadcrumb, isMenuOpen = false, onMenuClick }: TopBarProps) {
  const { user } = useAuth();

  return (
    <header className={styles.top}>
      {onMenuClick ? (
        <IconButton
          size="sm"
          label="Abrir menú"
          icon={<Menu />}
          onClick={onMenuClick}
          aria-controls="app-sidebar"
          aria-expanded={isMenuOpen}
          className={styles.menu}
        />
      ) : null}
      {breadcrumb ? <div className={styles.breadcrumb}>{breadcrumb}</div> : null}
      {search ? (
        <label className={styles.search}>
          <Search size={18} aria-hidden />
          <input
            className={styles.searchInput}
            type="search"
            aria-label={search.placeholder?.replace(/…$/, "") ?? "Buscar"}
            value={search.value}
            placeholder={search.placeholder ?? "Buscar…"}
            onChange={(event) => search.onChange(event.target.value)}
          />
        </label>
      ) : null}
      <div className={styles.right}>
        <ServiceStatusButton />
        {user ? (
          <div className={styles.user}>
            <UserAvatar
              initials={getInitials(user.fullName)}
              alt={user.fullName}
            />
            <div className={styles.userText}>
              <div className={styles.userName}>{user.fullName}</div>
              <div className={styles.userRole}>{ROLE_LABEL[user.role] ?? user.role}</div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
