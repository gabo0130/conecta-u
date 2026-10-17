"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectAnalysis } from "@/apis/interfaces/analysis";
import { getErrorMessage } from "@/utils/get-error-message";
import { fetchLatestAnalysis, requestAnalysis } from "../../utils/request-analysis";

export type AnalyzeState = "idle" | "analyzing" | "error";

/**
 * Último análisis del proyecto (RF12–RF14). Que aún no exista (404) no es un error: `analysis`
 * queda en null. `analyze()` pide uno nuevo y deja el mensaje del backend (503/409/422) tal cual.
 */
export function useProjectAnalysis(projectId: string) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>("idle");
  const [analyzeError, setAnalyzeError] = useState("");
  // El id vigente se lee al pedir uno nuevo sin depender del render en que se creó `analyze`.
  const currentId = useRef<string | null>(null);

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      try {
        const latest = await fetchLatestAnalysis(projectId);
        currentId.current = latest?.id ?? null;
        setAnalysis(latest);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err, "No se pudo cargar el análisis del proyecto."));
      } finally {
        setIsLoading(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Devuelve true si el análisis terminó bien. */
  const analyze = useCallback(async () => {
    setAnalyzeState("analyzing");
    setAnalyzeError("");
    try {
      const result = await requestAnalysis(projectId, currentId.current);
      currentId.current = result.id;
      setAnalysis(result);
      setAnalyzeState("idle");
      return true;
    } catch (err) {
      setAnalyzeError(getErrorMessage(err, "No se pudo analizar el proyecto. Intenta de nuevo."));
      setAnalyzeState("error");
      return false;
    }
  }, [projectId]);

  return {
    analysis,
    hasAnalysis: analysis !== null,
    isLoading,
    error,
    reload,
    analyze,
    analyzeState,
    isAnalyzing: analyzeState === "analyzing",
    analyzeError,
  };
}
