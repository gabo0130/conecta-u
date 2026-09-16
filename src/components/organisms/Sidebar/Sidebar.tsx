"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { BarChart3, Folder, Home, User, Users } from "lucide-react";
import { Logo } from "../../atoms";
import styles from "./Sidebar.module.css";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { key: "inicio", label: "Inicio", href: "/dashboard", icon: Home },
  { key: "proyectos", label: "Proyectos", href: "/proyectos", icon: Folder },
  { key: "colaboradores", label: "Colaboradores", href: "/colaboradores", icon: Users },
  { key: "perfil", label: "Mi perfil", href: "/perfil", icon: User },
  { key: "reportes", label: "Reportes", href: "/reportes", icon: BarChart3 },
];

type SidebarProps = {
  footer?: ReactNode;
};

export function Sidebar({ footer }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.side}>
      <div className={styles.brand}>
        <Logo mark="white" />
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const itemClassName = [styles.item, isActive ? styles.on : ""].filter(Boolean).join(" ");

          return (
            <Link key={key} href={href} className={itemClassName}>
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </aside>
  );
}
