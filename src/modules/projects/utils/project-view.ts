import type { BadgeTone } from "@/components/atoms";
import type { Project, ProjectStatus } from "@/apis/interfaces/projects";

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

export function getProjectMeta(project: Project) {
  return [project.semillero, project.program].filter(Boolean).join(" · ") || "Sin semillero ni programa";
}

export function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}
