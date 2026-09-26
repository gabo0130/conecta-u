"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { ProjectListItem } from "@/components/molecules";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { useProjects } from "@/modules/projects/hooks/useProjects/useProjects";
import { getProjectCode, getProjectMeta, getStatusView } from "@/modules/projects/utils/project-view";
import styles from "./proyectos.module.css";

export default function ProyectosPage() {
  const router = useRouter();
  const { projects, isLoading, error } = useProjects();
  const { projectTypes } = useProjectTypesCatalog();
  const { projectCategories } = useProjectCategoriesCatalog();
  const [query, setQuery] = useState("");

  const typeNameById = Object.fromEntries(projectTypes.map((type) => [type.id, type.name]));
  const categoryNameById = Object.fromEntries(projectCategories.map((category) => [category.id, category.name]));

  const normalized = query.trim().toLowerCase();
  const visible = normalized
    ? projects.filter((project) => project.title.toLowerCase().includes(normalized))
    : projects;

  return (
    <AppShell search={{ value: query, onChange: setQuery, placeholder: "Buscar proyectos…" }}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Mis proyectos</h1>
          <p className={styles.subtitle}>Proyectos de investigación que has registrado.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => router.push("/proyectos/nuevo")}>
          Registrar proyecto
        </Button>
      </div>

      <Card padding={0}>
        {isLoading ? <p className={styles.state}>Cargando proyectos…</p> : null}
        {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
        {!isLoading && !error && projects.length === 0 ? (
          <p className={styles.state}>Aún no has registrado proyectos.</p>
        ) : null}
        {!isLoading && !error && projects.length > 0 && visible.length === 0 ? (
          <p className={styles.state}>Ningún proyecto coincide con «{query}».</p>
        ) : null}
        {visible.map((project, index) => {
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
              bordered={index < visible.length - 1}
            />
          );
        })}
      </Card>
    </AppShell>
  );
}
