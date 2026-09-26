"use client";

import { ReactNode } from "react";
import type { UserRole } from "@/apis/interfaces/auth";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "../../atoms";
import styles from "./RoleGuard.module.css";

type RoleGuardProps = {
  roles: UserRole[];
  children: ReactNode;
};

/**
 * Muestra el contenido solo a los roles indicados; al resto le avisa que no tiene permisos.
 * No reemplaza la autorización del backend: evita mostrar pantallas que igual responderían 403.
 */
export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return (
      <Card padding={24}>
        <p className={styles.message}>No tienes permisos para ver esta página.</p>
      </Card>
    );
  }

  return <>{children}</>;
}
