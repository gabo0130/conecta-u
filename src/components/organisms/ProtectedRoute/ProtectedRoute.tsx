"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./ProtectedRoute.module.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirigir al login
      router.push("/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      // Usuario no tiene el rol requerido
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // La redirección se manejará arriba
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
