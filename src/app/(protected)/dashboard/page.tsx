"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, FileText, Folder, Plus, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { ProjectListItem, StatCard } from "@/components/molecules";
import { useProfile } from "@/modules/profile/hooks/useProfile/useProfile";
import { useProjects } from "@/modules/projects/hooks/useProjects/useProjects";
import { getProjectCode, getProjectMeta, getStatusView } from "@/modules/projects/utils/project-view";
import styles from "./dashboard.module.css";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function LeaderDashboard() {
  const router = useRouter();
  const { projects, isLoading, error } = useProjects();
  const [now] = useState(() => Date.now());

  const drafts = projects.filter((project) => project.status === "BORRADOR").length;
  const thisWeek = projects.filter(
    (project) => project.createdAt && now - new Date(project.createdAt).getTime() < WEEK_MS,
  ).length;
  const recent = projects.slice(0, 3);

  const stats = [
    { label: "Proyectos registrados", value: String(projects.length), hint: "en total", icon: Folder },
    { label: "En borrador", value: String(drafts), hint: "por completar", icon: FileText },
    {
      label: "Registrados esta semana",
      value: String(thisWeek),
      hint: "últimos 7 días",
      hintTone: thisWeek > 0 ? ("up" as const) : undefined,
      icon: CalendarPlus,
    },
  ];

  return (
    <>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card padding={0}>
        <div className={styles.listHead}>
          <h3 className={styles.listTitle}>Mis proyectos</h3>
          <Link href="/proyectos">Ver todos</Link>
        </div>
        {isLoading ? <p className={styles.state}>Cargando proyectos…</p> : null}
        {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
        {!isLoading && !error && recent.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.state}>Aún no has registrado proyectos.</p>
            <Button leftIcon={<Plus size={18} />} onClick={() => router.push("/proyectos/nuevo")}>
              Registrar mi primer proyecto
            </Button>
          </div>
        ) : null}
        {recent.map((project, index) => {
          const status = getStatusView(project.status);
          return (
            <ProjectListItem
              key={project.id}
              project={{
                code: getProjectCode(project.title),
                name: project.title,
                meta: getProjectMeta(project),
                status: status.label,
                tone: status.tone,
                href: `/proyectos/${project.id}`,
              }}
              bordered={index < recent.length - 1}
            />
          );
        })}
      </Card>
    </>
  );
}

function CollaboratorDashboard() {
  const router = useRouter();
  const { profile, isLoading, error } = useProfile();

  if (isLoading) return <p className={styles.state}>Cargando tu perfil…</p>;
  if (!profile) return <p className={styles.state}>{error || "No se pudo cargar tu perfil."}</p>;

  const stats = [
    { label: "Conocimientos y competencias", value: String(profile.skills.length), hint: "en tu perfil", icon: Wrench },
    { label: "Experiencias", value: String(profile.experiences.length), hint: "registradas", icon: FileText },
  ];

  return (
    <>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <Card padding={22}>
        <h3 className={styles.listTitle}>Mantén tu perfil al día</h3>
        <p className={styles.state}>
          Agrega tus conocimientos, experiencia y disponibilidad para que los líderes de proyecto puedan
          encontrarte.
        </p>
        <Button onClick={() => router.push("/perfil")}>Ir a mi perfil</Button>
      </Card>
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "";
  const isLeader = user?.role === "LIDER";
  const isCollaborator = user?.role === "COLABORADOR";

  const sidebarFooter = isLeader ? (
    <div className={styles.promo}>
      <div className={styles.promoTitle}>¿Nuevo proyecto?</div>
      <p className={styles.promoText}>Regístralo con su resumen, objetivos y habilidades.</p>
      <Button className={styles.promoBtn} onClick={() => router.push("/proyectos/nuevo")}>
        + Registrar
      </Button>
    </div>
  ) : undefined;

  return (
    <AppShell sidebarFooter={sidebarFooter}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Hola{firstName ? `, ${firstName}` : ""} 👋</h1>
          <p className={styles.subtitle}>
            {isLeader ? "Este es el estado de tus proyectos e investigaciones." : "Este es el resumen de tu perfil."}
          </p>
        </div>
        {isLeader ? (
          <Button leftIcon={<Plus size={18} />} onClick={() => router.push("/proyectos/nuevo")}>
            Registrar proyecto
          </Button>
        ) : null}
      </div>

      {isLeader ? <LeaderDashboard /> : null}
      {isCollaborator ? <CollaboratorDashboard /> : null}
    </AppShell>
  );
}
