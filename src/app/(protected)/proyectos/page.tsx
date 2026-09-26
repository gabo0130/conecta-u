"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { AdminProject } from "@/apis/interfaces/admin";
import type { Project } from "@/apis/interfaces/projects";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { AppShell, PageGrid } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { Pagination, ProjectListItem } from "@/components/molecules";
import { useAuth } from "@/contexts/auth-context";
import { useAdminProjects } from "@/modules/admin/hooks/useAdminProjects/useAdminProjects";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { useProjects } from "@/modules/projects/hooks/useProjects/useProjects";
import { getProjectCode, getProjectMeta, getStatusView } from "@/modules/projects/utils/project-view";
import styles from "./proyectos.module.css";

type ProjectListProps = {
  projects: (Project | AdminProject)[];
  meta: PageMeta | null;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error: string;
  query: string;
  emptyMessage: string;
};

/** Lista compartida: el ADMIN ve además el líder de cada proyecto en la línea de detalle. */
function ProjectList({ projects, meta, onPageChange, isLoading, error, query, emptyMessage }: ProjectListProps) {
  const { projectTypes } = useProjectTypesCatalog();
  const { projectCategories } = useProjectCategoriesCatalog();
  const typeNameById = Object.fromEntries(projectTypes.map((type) => [type.id, type.name]));
  const categoryNameById = Object.fromEntries(projectCategories.map((category) => [category.id, category.name]));

  const normalized = query.trim().toLowerCase();
  const visible = normalized
    ? projects.filter((project) => {
        const leaderName = "leader" in project ? (project.leader?.fullName ?? "") : "";
        return `${project.title} ${leaderName}`.toLowerCase().includes(normalized);
      })
    : projects;

  return (
    <Card padding={0}>
      {isLoading ? <p className={styles.state}>Cargando proyectos…</p> : null}
      {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
      {!isLoading && !error && projects.length === 0 ? <p className={styles.state}>{emptyMessage}</p> : null}
      {!isLoading && !error && normalized ? (
        <p className={styles.searchHint}>La búsqueda solo revisa los proyectos ya cargados en esta página.</p>
      ) : null}
      {!isLoading && !error && projects.length > 0 && visible.length === 0 ? (
        <p className={styles.state}>Ningún proyecto coincide con «{query}».</p>
      ) : null}
      {visible.map((project, index) => {
        const status = getStatusView(project.status);
        const meta = getProjectMeta(project, { typeNameById, categoryNameById });
        const leader = "leader" in project ? project.leader : undefined;
        return (
          <ProjectListItem
            key={project.id}
            project={{
              code: getProjectCode(project.title),
              name: project.title,
              meta: leader !== undefined ? `${meta} · Líder: ${leader?.fullName ?? "cuenta eliminada"}` : meta,
              status: status.label,
              tone: status.tone,
              href: `/proyectos/${project.id}`,
            }}
            bordered={index < visible.length - 1}
          />
        );
      })}
      {!isLoading && !error && !normalized && meta ? (
        <Pagination meta={meta} onPageChange={onPageChange} />
      ) : null}
    </Card>
  );
}

function LeaderProjects({ query }: { query: string }) {
  const router = useRouter();
  const { projects, meta, setPage, isLoading, error } = useProjects();

  return (
    <PageGrid
      width="wide"
      header={
        <div className={styles.head}>
          <div>
            <h1 className={styles.h1}>Mis proyectos</h1>
            <p className={styles.subtitle}>Proyectos que has registrado.</p>
          </div>
          <Button leftIcon={<Plus />} onClick={() => router.push("/proyectos/nuevo")}>
            Registrar proyecto
          </Button>
        </div>
      }
    >
      <ProjectList
        projects={projects}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        query={query}
        emptyMessage="Aún no has registrado proyectos."
      />
    </PageGrid>
  );
}

function AdminProjects({ query }: { query: string }) {
  const { projects, meta, setPage, isLoading, error } = useAdminProjects();

  return (
    <PageGrid
      width="wide"
      header={
        <div className={styles.head}>
          <div>
            <h1 className={styles.h1}>Todos los proyectos</h1>
            <p className={styles.subtitle}>
              {isLoading || !meta
                ? "Proyectos de todos los líderes."
                : `${meta.total} proyectos de todos los líderes.`}
            </p>
          </div>
        </div>
      }
    >
      <ProjectList
        projects={projects}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        query={query}
        emptyMessage="Todavía no hay proyectos registrados en la plataforma."
      />
    </PageGrid>
  );
}

export default function ProyectosPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const isAdmin = user?.role === "ADMIN";

  return (
    <AppShell
      search={{
        value: query,
        onChange: setQuery,
        placeholder: isAdmin ? "Buscar por proyecto o líder…" : "Buscar proyectos…",
      }}
    >
      {isAdmin ? <AdminProjects query={query} /> : <LeaderProjects query={query} />}
    </AppShell>
  );
}
