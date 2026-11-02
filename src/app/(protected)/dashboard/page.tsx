"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Contact,
  FileText,
  FileUp,
  Folder,
  History,
  Mail,
  Plus,
  Settings,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/templates";
import { ArrowLink, Button, Card } from "@/components/atoms";
import { BarList, LoadingState, ProjectListItem, StatCard, type BarListItem } from "@/components/molecules";
import { ReportsCard } from "@/components/organisms";
import type { CountBy, PlatformStats, SkillBalance } from "@/apis/interfaces/admin";
import { usePlatformStats } from "@/modules/admin/hooks/usePlatformStats/usePlatformStats";
import { AVAILABILITY_VIEW, PERSON_TYPE_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import { isAvailability, isPersonType, isProjectStatus } from "@/modules/admin/utils/stats-keys";
import { useAdminProjects } from "@/modules/admin/hooks/useAdminProjects/useAdminProjects";
import { useCollaborator } from "@/modules/collaborator/hooks/useCollaborator/useCollaborator";
import { useProjects } from "@/modules/projects/hooks/useProjects/useProjects";
import { useProjectMeta } from "@/modules/projects/hooks/useProjectMeta/useProjectMeta";
import { getProjectCode, getStatusView } from "@/modules/projects/utils/project-view";
import { useAllPages } from "@/hooks/useAllPages";
import type { PageMeta } from "@/apis/interfaces/pagination";
import styles from "./dashboard.module.css";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Elementos para calcular conteos exactos (en borrador, sin usuario, líderes…): si el listado cabe
 * en una página se usa esa; si tiene más, se traen todas. Antes se contaba solo la primera página.
 */
function useCountSource<T>(pageItems: T[], meta: PageMeta | null, url: string, key: string) {
  const needsAll = (meta?.totalPages ?? 1) > 1;
  const all = useAllPages<T>(url, key, needsAll, "No se pudieron calcular los conteos.");
  return needsAll ? all : { items: pageItems, isLoading: false, error: "" };
}

function LeaderDashboard() {
  const router = useRouter();
  const { projects, meta, isLoading, error } = useProjects();
  const projectMeta = useProjectMeta();
  const [now] = useState(() => Date.now());

  const counted = useCountSource(projects, meta, "/projects", "projects");
  const countsLoading = isLoading || counted.isLoading;
  const countsError = Boolean(error || counted.error);
  const drafts = counted.items.filter((project) => project.status === "BORRADOR").length;
  const thisWeek = counted.items.filter(
    (project) => project.createdAt && now - new Date(project.createdAt).getTime() < WEEK_MS,
  ).length;
  const recent = projects.slice(0, 3);

  const stats = [
    {
      label: "Proyectos registrados",
      value: String(meta?.total ?? projects.length),
      hint: "en total",
      icon: Folder,
      isLoading,
      hasError: Boolean(error),
    },
    {
      label: "En borrador",
      value: String(drafts),
      hint: "por completar",
      icon: FileText,
      isLoading: countsLoading,
      hasError: countsError,
    },
    {
      label: "Registrados esta semana",
      value: String(thisWeek),
      isLoading: countsLoading,
      hasError: countsError,
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
          <ArrowLink href="/proyectos">Ver todos</ArrowLink>
        </div>
        {isLoading ? <LoadingState message="Cargando proyectos…" /> : null}
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
                meta: projectMeta.isLoading ? "" : projectMeta.describe(project),
                isMetaLoading: projectMeta.isLoading,
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
  const { collaborator, isLoading, notFound, error } = useCollaborator();

  if (isLoading) return <LoadingState variant="page" message="Cargando tu perfil…" />;
  if (notFound) {
    return (
      <Card padding={22}>
        <h3 className={styles.listTitle}>Completa tu perfil de colaborador</h3>
        <p className={styles.state}>
          Aún no tienes un perfil técnico. Créalo para aparecer en las recomendaciones de los líderes de proyecto.
        </p>
        <Button onClick={() => router.push("/perfil")}>Completar mi perfil</Button>
      </Card>
    );
  }
  if (!collaborator) {
    return <p className={styles.state}>{error || "No se pudo cargar tu perfil."}</p>;
  }

  const stats = [
    {
      label: "Conocimientos y competencias técnicas",
      value: String(collaborator.skills.length),
      hint: "en tu perfil",
      icon: Wrench,
    },
    { label: "Experiencias", value: String(collaborator.experiences.length), hint: "registradas", icon: FileText },
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

/** Conteos del backend con su etiqueta en español (las de catálogo ya vienen con nombre). */
function toBars(items: CountBy[], labelOf: (key: string, label: string) => string = (_key, label) => label): BarListItem[] {
  return items.map((item) => ({ key: item.key, label: labelOf(item.key, item.label), value: item.count }));
}

const percent = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * 100));

const skillBars = (skills: SkillBalance[], value: (skill: SkillBalance) => number, display: (skill: SkillBalance) => string) =>
  skills.map((skill) => ({ key: skill.skillId, label: skill.name, value: value(skill), display: display(skill) }));

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** RF15: indicadores de proyectos, personas, perfiles y disponibilidad, con acceso a la gestión. */
function AdminStats({ stats }: { stats: PlatformStats }) {
  const { projects, people, availability, profiles, skills, certificates, invitations } = stats;
  const quality: BarListItem[] = [
    {
      key: "consent",
      label: "Con autorización de datos",
      value: percent(people.withConsent, people.total),
      display: `${percent(people.withConsent, people.total)} %`,
    },
    {
      key: "truthfulness",
      label: "Con declaración de veracidad",
      value: percent(people.truthfulnessDeclared, people.total),
      display: `${percent(people.truthfulnessDeclared, people.total)} %`,
    },
    {
      key: "account",
      label: "Con cuenta en la plataforma",
      value: percent(people.withAccount, people.total),
      display: `${percent(people.withAccount, people.total)} %`,
    },
    {
      key: "certificates",
      label: "Experiencias con certificado",
      value: percent(certificates.uploaded, certificates.required),
      display: certificates.required === 0 ? "—" : `${certificates.uploaded} de ${certificates.required}`,
    },
  ];

  const sections: { title: string; hint?: string; label: string; items: BarListItem[]; tone?: "red" | "green" | "amber" | "info"; empty?: string }[] = [
    { title: "Proyectos por tipo", label: "Proyectos por tipo", items: toBars(projects.byType) },
    { title: "Proyectos por categoría", label: "Proyectos por categoría", items: toBars(projects.byCategory) },
    {
      title: "Proyectos por estado",
      label: "Proyectos por estado",
      items: toBars(projects.byStatus, (key, label) => (isProjectStatus(key) ? getStatusView(key).label : label)),
      tone: "info",
    },
    {
      title: "Personas por tipo",
      label: "Personas activas por tipo",
      items: toBars(people.byPersonType, (key, label) => (isPersonType(key) ? PERSON_TYPE_LABEL[key] : label)),
      tone: "info",
    },
    {
      title: "Disponibilidad",
      hint: `${availability.averageWeeklyHours} h/semana en promedio · ${availability.totalWeeklyHoursAvailable} h disponibles`,
      label: "Personas por disponibilidad",
      items: toBars(availability.byStatus, (key, label) => (isAvailability(key) ? AVAILABILITY_VIEW[key].label : label)),
      tone: "green",
    },
    { title: "Programas con más personas", label: "Personas por programa", items: toBars(people.byProgram), tone: "info" },
    {
      title: "Habilidades más ofrecidas",
      label: "Habilidades más ofrecidas",
      items: skillBars(skills.topOffered, (skill) => skill.offered, (skill) => plural(skill.offered, "persona", "personas")),
      tone: "green",
    },
    {
      title: "Habilidades más pedidas",
      label: "Habilidades más pedidas por los perfiles requeridos",
      items: skillBars(skills.topDemanded, (skill) => skill.demanded, (skill) => plural(skill.demanded, "perfil", "perfiles")),
      empty: "Aún no hay perfiles requeridos analizados.",
    },
    {
      title: "Brechas de capacidades",
      hint: "Habilidades pedidas que menos personas ofrecen.",
      label: "Brechas de capacidades",
      items: skillBars(
        skills.gaps,
        (skill) => skill.demanded,
        (skill) => `${skill.offered} ofrecen · ${skill.demanded} piden`,
      ),
      tone: "amber",
      empty: "Aún no hay perfiles requeridos analizados.",
    },
    { title: "Calidad de los perfiles", label: "Calidad de los perfiles", items: quality, tone: "green" },
  ];

  const kpis = [
    {
      label: "Proyectos",
      value: String(projects.total),
      hint: `${projects.createdLast30Days} nuevos en 30 días`,
      icon: Folder,
    },
    {
      label: "Personas",
      value: String(people.total),
      hint: `${people.withAccount} con cuenta · ${people.total - people.withAccount} sin cuenta`,
      icon: Contact,
    },
    {
      label: "Recomendaciones",
      value: String(profiles.recommendations),
      hint:
        profiles.averageTopScore === null
          ? `en ${profiles.projectsWithRecommendations} proyectos`
          : `en ${profiles.projectsWithRecommendations} proyectos · 1.º puesto ${profiles.averageTopScore} % en promedio`,
      icon: Sparkles,
    },
    {
      label: "Convocatorias enviadas",
      value: String(invitations.sent),
      hint: invitations.failed > 0 ? `${invitations.failed} fallidas` : "por correo",
      icon: Mail,
    },
  ];

  return (
    <>
      <div className={[styles.stats, styles.stats4].join(" ")}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className={styles.statsGrid}>
        {sections.map((section) => (
          <Card key={section.title} padding={20}>
            <h3 className={styles.listTitle}>{section.title}</h3>
            {section.hint ? <p className={styles.sectionHint}>{section.hint}</p> : null}
            <div className={styles.sectionBody}>
              <BarList label={section.label} items={section.items} tone={section.tone} emptyMessage={section.empty} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/** ADMIN: indicadores de la plataforma (RF15), últimos proyectos, gestión y reportes (RF16). */
function AdminDashboard() {
  const router = useRouter();
  const { projects, isLoading: isLoadingProjects, error: projectsError } = useAdminProjects();
  const { stats, isLoading: isLoadingStats, error: statsError, reload: reloadStats } = usePlatformStats();
  const projectMeta = useProjectMeta();
  const recent = projects.slice(0, 5);

  return (
    <>
      {isLoadingStats ? <LoadingState message="Calculando indicadores…" /> : null}
      {!isLoadingStats && statsError ? (
        <Card padding={20}>
          <p className={styles.state}>{statsError}</p>
          <div className={styles.retry}>
            <Button variant="ghost" onClick={() => void reloadStats()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}
      {stats ? <AdminStats stats={stats} /> : null}

      <div className={styles.adminGrid}>
        <Card padding={0}>
          <div className={styles.listHead}>
            <h3 className={styles.listTitle}>Últimos proyectos</h3>
            <ArrowLink href="/proyectos">Ver todos</ArrowLink>
          </div>
          {isLoadingProjects ? <LoadingState message="Cargando proyectos…" /> : null}
          {!isLoadingProjects && projectsError ? <p className={styles.state}>{projectsError}</p> : null}
          {!isLoadingProjects && !projectsError && recent.length === 0 ? (
            <p className={styles.state}>Todavía no hay proyectos registrados.</p>
          ) : null}
          {recent.map((project, index) => {
            const status = getStatusView(project.status);
            const leader = `Líder: ${project.leader?.fullName ?? "cuenta eliminada"}`;
            return (
              <ProjectListItem
                key={project.id}
                project={{
                  code: getProjectCode(project.title),
                  name: project.title,
                  meta: projectMeta.isLoading ? leader : `${projectMeta.describe(project)} · ${leader}`,
                  isMetaLoading: projectMeta.isLoading,
                  status: status.label,
                  tone: status.tone,
                  href: `/proyectos/${project.id}`,
                }}
                bordered={index < recent.length - 1}
              />
            );
          })}
        </Card>

        <Card padding={20}>
          <h3 className={styles.listTitle}>Gestión</h3>
          <div className={styles.quickActions}>
            <Button leftIcon={<FileUp />} fullWidth onClick={() => router.push("/importar")}>
              Importar colaboradores
            </Button>
            <Button variant="ghost" leftIcon={<Contact />} fullWidth onClick={() => router.push("/colaboradores")}>
              Gestionar personas
            </Button>
            <Button variant="ghost" leftIcon={<Users />} fullWidth onClick={() => router.push("/users")}>
              Gestionar usuarios
            </Button>
            <Button variant="ghost" leftIcon={<Settings />} fullWidth onClick={() => router.push("/settings")}>
              Catálogos y plantillas
            </Button>
            <Button variant="ghost" leftIcon={<History />} fullWidth onClick={() => router.push("/importar/historial")}>
              Historial de importaciones
            </Button>
          </div>
        </Card>
      </div>

      <ReportsCard />
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "";
  const isLeader = user?.role === "LIDER";
  const isCollaborator = user?.role === "COLABORADOR";
  const isAdmin = user?.role === "ADMIN";

  const sidebarFooter = isLeader ? (
    <div className={styles.promo}>
      <div className={styles.promoTitle}>¿Nuevo proyecto?</div>
      <p className={styles.promoText}>Regístralo con su resumen, objetivos y habilidades.</p>
      <Button size="sm" fullWidth onClick={() => router.push("/proyectos/nuevo")}>
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
            {isLeader
              ? "Este es el estado de tus proyectos e investigaciones."
              : isAdmin
                ? "Este es el estado general de la plataforma."
                : "Este es el resumen de tu perfil."}
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
      {isAdmin ? <AdminDashboard /> : null}
    </AppShell>
  );
}
