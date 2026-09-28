"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "../../atoms";
import styles from "./ProtectedRoute.module.css";

type ProtectedRouteProps = {
  children: ReactNode;
};

/** Exige sesión para las rutas privadas. Los permisos por rol los muestra `RoleGuard` en cada página. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.wrap}>
        <Spinner size="xl" label="Cargando sesión" />
      </div>
    );
  }

  // Sin sesión no se pinta nada mientras el efecto redirige al login.
  return isAuthenticated ? <>{children}</> : null;
}
