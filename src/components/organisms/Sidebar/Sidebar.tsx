"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Folder, Home, LogOut, LucideIcon, Settings, User, Users, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { IconButton, Logo } from "../../atoms";
import styles from "./Sidebar.module.css";

const ICONS: Record<string, LucideIcon> = {
  dashboard: Home,
  folder: Folder,
  user: User,
  people: Users,
  settings: Settings,
};

type SidebarProps = {
  footer?: ReactNode;
  /** En pantallas angostas el sidebar es un panel deslizable: `isOpen` lo muestra. */
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ footer, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items = (user?.menu ?? []).filter((item) => item.path);

  return (
    <>
      {isOpen ? <div className={styles.backdrop} onClick={onClose} aria-hidden /> : null}
      <aside id="app-sidebar" className={[styles.side, isOpen ? styles.open : ""].filter(Boolean).join(" ")}>
        <div className={styles.brand}>
          <Logo mark="white" />
          <IconButton variant="plain" size="sm" label="Cerrar menú" icon={<X />} onClick={onClose} className={styles.close} />
        </div>
        <nav className={styles.nav}>
          {items.map(({ id, label, path = "", icon }) => {
            const Icon = ICONS[icon ?? ""] ?? Folder;
            const isActive = pathname === path || pathname.startsWith(`${path}/`);
            const itemClassName = [styles.item, isActive ? styles.on : ""].filter(Boolean).join(" ");

            return (
              <Link key={id} href={path} className={itemClassName} onClick={onClose}>
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.footer}>
          {footer}
          <button type="button" className={styles.logout} onClick={() => void logout()}>
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
