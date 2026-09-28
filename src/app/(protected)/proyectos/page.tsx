"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { AdminProject } from "@/apis/interfaces/admin";
import type { Project } from "@/apis/interfaces/projects";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { AppShell, PageGrid } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { LoadingState, Pagination, ProjectListItem } from "@/components/molecules";
import { useAuth } from "@/contexts/auth-context";
import { useAdminProjects } from "@/modules/admin/hooks/useAdminProjects/useAdminProjects";
import { useProjects } from "@/modules/projects/hooks/useProjects/useProjects";
import { useAllPages } from "@/hooks/useAllPages";
import { paginateLocally } from "@/utils/paginate";
import { useProjectMeta } from "@/modules/projects/hooks/useProjectMeta/useProjectMeta";
import { getProjectCode, getStatusView } from "@/modules/projects/utils/project-view";
import styles from "./proyectos.module.css";

const PAGE_SIZE = 20;

type ProjectListProps = {
  /** Ruta del listado paginado: la búsqueda recorre todas sus páginas. */
  listUrl: string;
  projects: (Project | AdminProject)[];
  meta: PageMeta | null;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error: string;
  query: string;
  emptyMessage: string;
};

/** Lista compartida: el ADMIN ve además el líder de cada proyecto en la línea de detalle. */
function ProjectList({ listUrl, projects, meta, onPageChange, isLoading, error, query, emptyMessage }: ProjectListProps) {
  const projectMeta = useProjectMeta();

  const normalized = query.trim().toLowerCase();
  const searching = Boolean(normalized);
  // Con búsqueda se revisan todos los proyectos (todas las páginas), no solo la página cargada.
  const all = useAllPages<Project | AdminProject>(listUrl, "projects", searching, "No se pudieron buscar los proyectos.");
  // La página de resultados vuelve a 1 cada vez que cambia el texto buscado.
  const [searchPage, setSearchPage] = useState({ query: "", page: 1 });
  const matches = all.items.filter((project) => {
    const leaderName = "leader" in project ? (project.leader?.fullName ?? "") : "";
    return `${project.title} ${leaderName}`.toLowerCase().includes(normalized);
  });
  const searchResult = paginateLocally(matches, searchPage.query === normalized ? searchPage.page : 1, PAGE_SIZE);

  const visible = searching ? searchResult.pageItems : projects;
  const listMeta = searching ? searchResult.meta : meta;
  const changePage = searching ? (page: number) => setSearchPage({ query: normalized, page }) : onPageChange;
  const loading = isLoading || (searching && all.isLoading);
  const listError = error || (searching ? all.error : "");

  return (
    <Card padding={0}>
      {loading ? <LoadingState message={searching ? "Buscando en todos los proyectos…" : "Cargando proyectos…"} /> : null}
      {!loading && listError ? <p className={styles.state}>{listError}</p> : null}
      {!loading && !listError && !searching && projects.length === 0 ? <p className={styles.state}>{emptyMessage}</p> : null}
      {!loading && !listError && searching && visible.length === 0 ? (
        <p className={styles.state}>Ningún proyecto coincide con «{query}».</p>
      ) : null}
      {!loading && !listError && visible.map((project, index) => {
        const status = getStatusView(project.status);
        const leader = "leader" in project ? project.leader : undefined;
        const parts = [
          projectMeta.isLoading ? null : projectMeta.describe(project),
          leader !== undefined ? `Líder: ${leader?.fullName ?? "cuenta eliminada"}` : null,
        ];
        return (
          <ProjectListItem
            key={project.id}
            project={{
              code: getProjectCode(project.title),
              name: project.title,
              meta: parts.filter(Boolean).join(" · "),
              isMetaLoading: projectMeta.isLoading,
              status: status.label,
              tone: status.tone,
              href: `/proyectos/${project.id}`,
            }}
            bordered={index < visible.length - 1}
          />
        );
      })}
      {!loading && !listError && listMeta ? <Pagination meta={listMeta} onPageChange={changePage} /> : null}
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
        listUrl="/projects"
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
        listUrl="/admin/projects"
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
