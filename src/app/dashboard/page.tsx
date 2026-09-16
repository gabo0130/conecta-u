"use client";

import dynamic from "next/dynamic";
import { ComponentType, useMemo, useState } from "react";
import { DashboardNavId } from "../../components/dashboard-tokens";
import { DashboardLayout } from "../../components/templates";
import styles from "./page.module.css";

const SectionLoader = () => (
  <section className={styles.loadingCard}>
    <p className={styles.loadingEyebrow}>Cargando contenido</p>
    <div className={styles.loadingLine} />
    <div className={styles.loadingLineShort} />
  </section>
);

const ExampleSection = dynamic(
  () => import("../../components/dashboard-panels/ExampleSection").then((module) => module.ExampleSection),
  { loading: SectionLoader, ssr: false },
);

const sectionCatalog: Record<DashboardNavId, ComponentType> = {
  dashboard: () => (
    <ExampleSection
      eyebrow="Panel"
      title="Dashboard"
      description="Vista general de ejemplo. Sustituye este contenido por los widgets reales de tu proyecto."
    />
  ),
  "section-two": () => (
    <ExampleSection
      eyebrow="Panel"
      title="Sección 2"
      description="Segunda sección de ejemplo, lista para adaptarse a un nuevo módulo."
    />
  ),
  settings: () => (
    <ExampleSection
      eyebrow="Panel"
      title="Configuración"
      description="Sección de ejemplo para ajustes del sistema."
    />
  ),
};

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState<DashboardNavId>("dashboard");

  const ActiveSection = useMemo(() => sectionCatalog[activeItem], [activeItem]);

  return (
    <DashboardLayout activeItem={activeItem} onNavigate={setActiveItem}>
      <div className={styles.page}>
        <ActiveSection key={activeItem} />
      </div>
    </DashboardLayout>
  );
}
