"use client";

import { Menu, Search } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { IconButton, UserAvatar } from "../../atoms";
import { ServiceStatusButton } from "../ServiceStatusButton/ServiceStatusButton";
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

const ROLE_LABELS: Record<string, string> = {
  LIDER: "Líder de proyecto",
  COLABORADOR: "Colaborador",
  ADMIN: "Administrador",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

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
          <Search size={18} />
          <input
            className={styles.searchInput}
            type="search"
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
              <div className={styles.userRole}>{ROLE_LABELS[user.role] ?? user.role}</div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
