"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Contact, FileText, FileUp, Folder, History, Plus, Users, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { LoadingState, ProjectListItem, StatCard } from "@/components/molecules";
import { useAdminCollaborators } from "@/modules/admin/hooks/useAdminCollaborators/useAdminCollaborators";
import { useAdminProjects } from "@/modules/admin/hooks/useAdminProjects/useAdminProjects";
import { useUsers } from "@/modules/admin/hooks/useUsers/useUsers";
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
          <Link href="/proyectos">Ver todos</Link>
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
      label: "Conocimientos y competencias",
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

/** ADMIN: vista global de la plataforma (proyectos, perfiles y cuentas) y accesos a su gestión. */
function AdminDashboard() {
  const router = useRouter();
  const { projects, meta: projectsMeta, isLoading: isLoadingProjects, error: projectsError } = useAdminProjects();
  const {
    collaborators,
    meta: collaboratorsMeta,
    isLoading: isLoadingCollaborators,
    error: collaboratorsError,
  } = useAdminCollaborators();
  const { users, meta: usersMeta, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const projectMeta = useProjectMeta();
  // Totales desde `meta.total`; los desgloses se cuentan sobre todos los elementos, no sobre la página.
  const allProjects = useCountSource(projects, projectsMeta, "/admin/projects", "projects");
  const allCollaborators = useCountSource(collaborators, collaboratorsMeta, "/admin/collaborators", "collaborators");
  const allUsers = useCountSource(users, usersMeta, "/users", "users");
  const drafts = allProjects.items.filter((project) => project.status === "BORRADOR").length;
  const withoutUser = allCollaborators.items.filter((collaborator) => !collaborator.user).length;
  const leaders = allUsers.items.filter((user) => user.role === "LIDER").length;
  const recent = projects.slice(0, 5);

  const stats = [
    {
      label: "Proyectos",
      value: String(projectsMeta?.total ?? projects.length),
      isLoading: isLoadingProjects || allProjects.isLoading,
      hasError: Boolean(projectsError || allProjects.error),
      hint: `${drafts} en borrador`,
      icon: Folder,
    },
    {
      label: "Colaboradores",
      value: String(collaboratorsMeta?.total ?? collaborators.length),
      isLoading: isLoadingCollaborators || allCollaborators.isLoading,
      hasError: Boolean(collaboratorsError || allCollaborators.error),
      hint: `${withoutUser} sin usuario`,
      icon: Contact,
    },
    {
      label: "Usuarios",
      value: String(usersMeta?.total ?? users.length),
      isLoading: isLoadingUsers || allUsers.isLoading,
      hasError: Boolean(usersError || allUsers.error),
      hint: `${leaders} líderes de proyecto`,
      icon: Users,
    },
  ];

  return (
    <>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className={styles.adminGrid}>
        <Card padding={0}>
          <div className={styles.listHead}>
            <h3 className={styles.listTitle}>Últimos proyectos</h3>
            <Link href="/proyectos">Ver todos</Link>
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
              Ver colaboradores
            </Button>
            <Button variant="ghost" leftIcon={<Users />} fullWidth onClick={() => router.push("/users")}>
              Gestionar usuarios
            </Button>
            <Button variant="ghost" leftIcon={<History />} fullWidth onClick={() => router.push("/importar/historial")}>
              Historial de importaciones
            </Button>
          </div>
        </Card>
      </div>
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
