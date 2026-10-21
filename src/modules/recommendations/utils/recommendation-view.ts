import type { MatchComponents } from "@/apis/interfaces/recommendations";

// Presentación de las recomendaciones (RF15–RF17). Etiquetas de disponibilidad, tipo de persona y
// nivel en collaborator-view; las de prioridad e importancia en analysis-view.

export type ScoreTone = "high" | "medium" | "low";

/** Orden fijo en que se explican los componentes del puntaje. */
export const COMPONENT_KEYS: (keyof MatchComponents)[] = ["skills", "semantic", "experience", "availability"];

export const COMPONENT_LABEL: Record<keyof MatchComponents, string> = {
  skills: "Habilidades",
  semantic: "Afinidad semántica",
  experience: "Experiencia",
  availability: "Disponibilidad",
};

// Umbrales solo visuales para el color de la barra; no cambian el orden ni el puntaje.
const HIGH_SCORE = 70;
const MEDIUM_SCORE = 40;

export function scoreTone(score: number): ScoreTone {
  if (score >= HIGH_SCORE) return "high";
  if (score >= MEDIUM_SCORE) return "medium";
  return "low";
}

/** Ancho de una barra (0–100 %) a partir de un valor 0–100, acotado por si llega algo fuera de rango. */
export function barWidth(value: number) {
  return `${Math.min(Math.max(value, 0), 100)}%`;
}

/** 0–1 → "52 %". */
export function formatPercent(ratio: number) {
  return `${Math.round(ratio * 100)} %`;
}

export function formatScore(score: number) {
  return Math.round(score).toString();
}

export function formatMonths(months: number) {
  return months === 1 ? "1 mes" : `${months} meses`;
}

/**
 * Puntos que aporta cada componente al puntaje final (peso aplicado × valor × 100). Su suma es el
 * puntaje, salvo redondeo; un componente con peso 0 (semántica sin embeddings) aporta 0.
 */
export function componentContributions(components: MatchComponents, weights: MatchComponents) {
  return COMPONENT_KEYS.map((key) => ({
    key,
    label: COMPONENT_LABEL[key],
    value: components[key],
    weight: weights[key],
    points: Math.round(components[key] * weights[key] * 1000) / 10,
  }));
}
