"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Contact, FileText, FileUp, Folder, Plus, Users, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { ProjectListItem, StatCard } from "@/components/molecules";
import { useAdminCollaborators } from "@/modules/admin/hooks/useAdminCollaborators/useAdminCollaborators";
import { useAdminProjects } from "@/modules/admin/hooks/useAdminProjects/useAdminProjects";
import { useUsers } from "@/modules/admin/hooks/useUsers/useUsers";
import { useCollaborator } from "@/modules/collaborator/hooks/useCollaborator/useCollaborator";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { useProjects } from "@/modules/projects/hooks/useProjects/useProjects";
import { getProjectCode, getProjectMeta, getStatusView } from "@/modules/projects/utils/project-view";
import styles from "./dashboard.module.css";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function LeaderDashboard() {
  const router = useRouter();
  const { projects, meta, isLoading, error } = useProjects();
  const { projectTypes } = useProjectTypesCatalog();
  const { projectCategories } = useProjectCategoriesCatalog();
  const [now] = useState(() => Date.now());

  const typeNameById = Object.fromEntries(projectTypes.map((type) => [type.id, type.name]));
  const categoryNameById = Object.fromEntries(projectCategories.map((category) => [category.id, category.name]));

  const drafts = projects.filter((project) => project.status === "BORRADOR").length;
  const thisWeek = projects.filter(
    (project) => project.createdAt && now - new Date(project.createdAt).getTime() < WEEK_MS,
  ).length;
  const recent = projects.slice(0, 3);

  const stats = [
    { label: "Proyectos registrados", value: String(meta?.total ?? projects.length), hint: "en total", icon: Folder },
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
                meta: getProjectMeta(project, { typeNameById, categoryNameById }),
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

  if (isLoading) return <p className={styles.state}>Cargando tu perfil…</p>;
  if (notFound || !collaborator) {
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
  const { collaborators, meta: collaboratorsMeta, isLoading: isLoadingCollaborators } = useAdminCollaborators();
  const { users, meta: usersMeta, isLoading: isLoadingUsers } = useUsers();
  const { projectTypes } = useProjectTypesCatalog();
  const { projectCategories } = useProjectCategoriesCatalog();

  const typeNameById = Object.fromEntries(projectTypes.map((type) => [type.id, type.name]));
  const categoryNameById = Object.fromEntries(projectCategories.map((category) => [category.id, category.name]));
  const count = (isLoading: boolean, value: number) => (isLoading ? "…" : String(value));
  // Los conteos por página (borrador, sin usuario, líderes) son aproximados: solo miran la
  // página cargada, no el total real. Los totales sí vienen del backend (`meta.total`).
  const withoutUser = collaborators.filter((collaborator) => !collaborator.user).length;
  const leaders = users.filter((user) => user.role === "LIDER").length;
  const recent = projects.slice(0, 5);

  const stats = [
    {
      label: "Proyectos",
      value: count(isLoadingProjects, projectsMeta?.total ?? projects.length),
      hint: `${projects.filter((project) => project.status === "BORRADOR").length} en borrador`,
      icon: Folder,
    },
    {
      label: "Colaboradores",
      value: count(isLoadingCollaborators, collaboratorsMeta?.total ?? collaborators.length),
      hint: `${withoutUser} sin usuario`,
      icon: Contact,
    },
    {
      label: "Usuarios",
      value: count(isLoadingUsers, usersMeta?.total ?? users.length),
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
          {isLoadingProjects ? <p className={styles.state}>Cargando proyectos…</p> : null}
          {!isLoadingProjects && projectsError ? <p className={styles.state}>{projectsError}</p> : null}
          {!isLoadingProjects && !projectsError && recent.length === 0 ? (
            <p className={styles.state}>Todavía no hay proyectos registrados.</p>
          ) : null}
          {recent.map((project, index) => {
            const status = getStatusView(project.status);
            const meta = getProjectMeta(project, { typeNameById, categoryNameById });
            return (
              <ProjectListItem
                key={project.id}
                project={{
                  code: getProjectCode(project.title),
                  name: project.title,
                  meta: `${meta} · Líder: ${project.leader?.fullName ?? "cuenta eliminada"}`,
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
