import type { AcceptanceCounts } from "@/apis/interfaces/admin";

/** Tasa de aceptación: 0,6667 → "66,7 %"; sin decisiones, "—" (no 0 %). */
export function formatAcceptanceRate(rate: number | null): string {
  return rate === null ? "—" : `${(rate * 100).toLocaleString("es-CO", { maximumFractionDigits: 1 })} %`;
}

const plural = (count: number, singular: string, many: string) => `${count} ${count === 1 ? singular : many}`;

/** "3 aceptadas · 1 descartada". */
export function formatDecisionCounts(counts: Pick<AcceptanceCounts, "accepted" | "discarded">): string {
  return `${plural(counts.accepted, "aceptada", "aceptadas")} · ${plural(counts.discarded, "descartada", "descartadas")}`;
}
