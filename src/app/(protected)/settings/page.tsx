"use client";

import { AppShell, PageGrid } from "@/components/templates";
import { Card } from "@/components/atoms";
import { RoleGuard } from "@/components/organisms";
import styles from "./settings.module.css";

export default function SettingsPage() {
  return (
    <AppShell>
      <RoleGuard roles={["ADMIN"]}>
        <PageGrid header={<h1 className={styles.h1}>Configuración</h1>}>
          <Card padding={24}>
            <p className={styles.text}>
              La gestión de catálogos (programas, habilidades, tipos y categorías de proyecto) está planeada para una
              próxima iteración.
            </p>
            <p className={styles.badge}>En desarrollo</p>
          </Card>
        </PageGrid>
      </RoleGuard>
    </AppShell>
  );
}
