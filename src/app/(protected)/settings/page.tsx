"use client";

import { AppShell } from "@/components/templates";
import { Card } from "@/components/atoms";
import { useAuth } from "@/contexts/auth-context";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <h1 className={styles.h1}>Configuración</h1>
      <Card padding={24}>
        {user?.role !== "ADMIN" ? (
          <p className={styles.text}>No tienes permisos para ver esta página.</p>
        ) : (
          <>
            <p className={styles.text}>
              La gestión de catálogos (programas, habilidades, tipos y categorías de proyecto) está planeada
              para una próxima iteración.
            </p>
            <p className={styles.badge}>En desarrollo</p>
          </>
        )}
      </Card>
    </AppShell>
  );
}
