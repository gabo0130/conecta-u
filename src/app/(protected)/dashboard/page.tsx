"use client";

import { Folder, Plus, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { ProjectListItem, ProjectSummary, StatCard } from "@/components/molecules";
import styles from "./dashboard.module.css";

const STATS = [
  { label: "Proyectos activos", value: "4", hint: "+1 esta semana", hintTone: "up" as const, icon: Folder },
  { label: "Colaboradores registrados", value: "128", hint: "en 9 semilleros", icon: Users },
  { label: "Recomendaciones generadas", value: "37", hint: "últimos 30 días", icon: Sparkles },
];

const PROJECTS: ProjectSummary[] = [
  {
    code: "SG",
    name: "SISGELAB — Sistema de gestión de laboratorios",
    meta: "Semillero de Software · 4 perfiles requeridos",
    status: "Análisis listo",
    tone: "green",
  },
  {
    code: "RA",
    name: "Reducción de desperdicio de alimentos (IoT)",
    meta: "Semillero de Investigación · pendiente de análisis",
    status: "En análisis",
    tone: "amber",
  },
  {
    code: "HV",
    name: "Gestión de visitas empresariales",
    meta: "Dirección de programa · 3 colaboradores convocados",
    status: "Borrador",
    tone: "gray",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "";

  const sidebarFooter = (
    <div className={styles.promo}>
      <div className={styles.promoTitle}>¿Nuevo proyecto?</div>
      <p className={styles.promoText}>Regístralo y deja que la IA sugiera los perfiles.</p>
      <Button className={styles.promoBtn}>+ Registrar</Button>
    </div>
  );

  return (
    <AppShell sidebarFooter={sidebarFooter} searchPlaceholder="Buscar proyectos, colaboradores…">
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Hola{firstName ? `, ${firstName}` : ""} 👋</h1>
          <p className={styles.subtitle}>Este es el estado de tus proyectos e investigaciones.</p>
        </div>
        <Button leftIcon={<Plus size={18} />}>Registrar proyecto</Button>
      </div>

      <div className={styles.stats}>
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card padding={0}>
        <div className={styles.listHead}>
          <h3 className={styles.listTitle}>Mis proyectos</h3>
          <a href="#">Ver todos</a>
        </div>
        {PROJECTS.map((project, index) => (
          <ProjectListItem
            key={project.code}
            project={project}
            bordered={index < PROJECTS.length - 1}
          />
        ))}
      </Card>
    </AppShell>
  );
}
