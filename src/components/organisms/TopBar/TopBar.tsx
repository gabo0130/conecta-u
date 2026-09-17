"use client";

import { Bell, Search } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { UserAvatar } from "../../atoms";
import styles from "./TopBar.module.css";

type TopBarProps = {
  searchPlaceholder?: string;
  breadcrumb?: ReactNode;
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

export function TopBar({ searchPlaceholder = "Buscar…", breadcrumb }: TopBarProps) {
  const { user } = useAuth();

  return (
    <header className={styles.top}>
      {breadcrumb ? (
        <div className={styles.breadcrumb}>{breadcrumb}</div>
      ) : (
        <div className={styles.search}>
          <Search size={18} />
          {searchPlaceholder}
        </div>
      )}
      <div className={styles.right}>
        <Bell size={21} />
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
