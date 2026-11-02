"use client";

import { ReactNode } from "react";
import type { UserRole } from "@/apis/interfaces/auth";
import { useAuth } from "@/contexts/auth-context";
import { RoleGuard } from "../../organisms";
import { AppShell } from "../AppShell/AppShell";

type RolePageProps = {
  roles: UserRole[];
  /** La página completa (con su `AppShell`); solo se monta, y pide datos, si el rol puede verla. */
  children: ReactNode;
};

/**
 * Guarda de rol para páginas que montan su propio `AppShell` (con migas de pan): a otro rol le
 * muestra el aviso de `RoleGuard` sin montar la página, así no llama a la API para recibir un 403.
 */
export function RolePage({ roles, children }: RolePageProps) {
  const { user } = useAuth();
  if (user && roles.includes(user.role)) return <>{children}</>;
  return (
    <AppShell>
      <RoleGuard roles={roles}>{null}</RoleGuard>
    </AppShell>
  );
}
