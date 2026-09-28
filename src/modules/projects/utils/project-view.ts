import type { BadgeTone } from "@/components/atoms";
import type { Project, ProjectStatus } from "@/apis/interfaces/projects";
import { formatDate as formatDateValue } from "@/utils/dates";

const STATUS_VIEW: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  BORRADOR: { label: "Borrador", tone: "gray" },
  EN_ANALISIS: { label: "En análisis", tone: "amber" },
  ANALIZADO: { label: "Analizado", tone: "green" },
};

export function getStatusView(status: ProjectStatus) {
  return STATUS_VIEW[status];
}

export function getProjectCode(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export type ProjectMetaCatalogs = {
  typeNameById?: Record<string, string>;
  categoryNameById?: Record<string, string>;
};

export function getProjectMeta(project: Pick<Project, "typeId" | "categoryId">, catalogs: ProjectMetaCatalogs = {}) {
  const typeName = catalogs.typeNameById?.[project.typeId];
  const categoryName = catalogs.categoryNameById?.[project.categoryId];
  return [typeName, categoryName].filter(Boolean).join(" · ") || "Sin tipo ni categoría";
}

export function formatDate(iso?: string | null) {
  return formatDateValue(iso, { day: "numeric", month: "short", year: "numeric" });
}
