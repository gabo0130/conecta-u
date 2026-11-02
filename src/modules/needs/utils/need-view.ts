import type { BadgeTone } from "@/components/atoms";
import type { NeedKind, NeedSort, NeedStatus, PriorityLevel } from "@/apis/interfaces/needs";
import { toOptions } from "@/utils/to-options";

// Etiquetas en español de los enums de necesidades (una sola vez, como `collaborator-view.ts`).

export const NEED_KIND_LABEL: Record<NeedKind, string> = {
  ACADEMICA: "Académica",
  ADMINISTRATIVA: "Administrativa",
  INVESTIGATIVA: "Investigativa",
  TECNOLOGICA: "Tecnológica",
  BIENESTAR: "Bienestar",
  INFRAESTRUCTURA: "Infraestructura",
  INNOVACION: "Innovación",
};

export const NEED_STATUS_VIEW: Record<NeedStatus, { label: string; tone: BadgeTone }> = {
  REGISTRADA: { label: "Registrada", tone: "gray" },
  CARACTERIZADA: { label: "Caracterizada", tone: "amber" },
  CONVERTIDA: { label: "Convertida en oportunidad", tone: "green" },
  DESCARTADA: { label: "Descartada", tone: "red" },
};

export const PRIORITY_VIEW: Record<PriorityLevel, { label: string; tone: BadgeTone }> = {
  ALTA: { label: "Prioridad alta", tone: "red" },
  MEDIA: { label: "Prioridad media", tone: "amber" },
  BAJA: { label: "Prioridad baja", tone: "gray" },
};

export const NEED_SORT_LABEL: Record<NeedSort, string> = {
  priority: "Mayor prioridad primero",
  recent: "Más recientes primero",
};

/** Escala 1–5 de urgencia e impacto, con lo que significa cada valor. */
export const NEED_SCALE_LABEL: Record<"1" | "2" | "3" | "4" | "5", string> = {
  "1": "1 · Muy baja",
  "2": "2 · Baja",
  "3": "3 · Media",
  "4": "4 · Alta",
  "5": "5 · Muy alta",
};

export const NEED_KIND_OPTIONS = toOptions(NEED_KIND_LABEL);
export const NEED_SORT_OPTIONS = toOptions(NEED_SORT_LABEL);
export const NEED_SCALE_OPTIONS = toOptions(NEED_SCALE_LABEL);
export const NEED_STATUS_FILTER_OPTIONS = [
  { value: "" as const, label: "Todos los estados" },
  ...toOptions(NEED_STATUS_VIEW, (view) => view.label),
];

export const isOpenNeed = (status: NeedStatus) => status === "REGISTRADA" || status === "CARACTERIZADA";

/** 72.5 → "72,5"; los puntajes se muestran sin decimales de más. */
export const formatScore = (value: number) =>
  value.toLocaleString("es-CO", { maximumFractionDigits: 1 });

export const NEED_LIMITS = {
  title: { min: 5, max: 160 },
  description: { min: 30, max: 4000 },
  dependencyMax: 150,
  discardReasonMax: 500,
} as const;

/** Misma validación que el backend (`CreateNeedDto`): mensajes en español, en línea. */
export function validateNeed(input: { title: string; description: string }): string | null {
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < NEED_LIMITS.title.min) {
    return `El título debe tener al menos ${NEED_LIMITS.title.min} caracteres.`;
  }
  if (description.length < NEED_LIMITS.description.min) {
    return `Describe la necesidad con al menos ${NEED_LIMITS.description.min} caracteres: qué pasa, a quién afecta y qué se espera.`;
  }
  return null;
}
