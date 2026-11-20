"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectAnalysis } from "@/apis/interfaces/analysis";
import { getErrorMessage } from "@/utils/get-error-message";
import {
  fetchLatestAnalysis,
  findRunningAnalysis,
  requestAnalysis,
  waitForAnalysis,
} from "../../utils/request-analysis";

export type AnalyzeState = "idle" | "analyzing" | "error";

/**
 * Último análisis del proyecto (RF8–RF10). Que aún no exista (404) no es un error: `analysis`
 * queda en null. `analyze()` pide uno nuevo y espera a que termine en el servidor; si al abrir
 * la página ya hay uno en curso (se salió y volvió, u otra pestaña), sigue esperándolo.
 * Al salir de la página deja de consultar: el análisis sigue en el servidor.
 */
export function useProjectAnalysis(projectId: string, onSettled?: (ok: boolean) => void) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>("idle");
  const [analyzeError, setAnalyzeError] = useState("");
  /** Cuándo empezó el análisis en curso (para mostrar cuánto lleva, también al retomarlo). */
  const [analyzingSince, setAnalyzingSince] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  // El aviso al terminar se lee al terminar, no cuando se empezó a esperar.
  const settled = useRef(onSettled);
  useEffect(() => {
    settled.current = onSettled;
  }, [onSettled]);

  useEffect(
    () => () => {
      abort.current?.abort();
    },
    [],
  );

  /** Espera un análisis; devuelve true si terminó bien. */
  const follow = useCallback(async (wait: (signal: AbortSignal) => Promise<ProjectAnalysis>, since: number) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setAnalyzeState("analyzing");
    setAnalyzeError("");
    setAnalyzingSince(since);
    try {
      const result = await wait(controller.signal);
      setAnalysis(result);
      setAnalyzeState("idle");
      settled.current?.(true);
      return true;
    } catch (err) {
      // Se salió de la página: no es un fallo del análisis.
      if (controller.signal.aborted) return false;
      setAnalyzeError(getErrorMessage(err, "No se pudo analizar el proyecto. Intenta de nuevo."));
      setAnalyzeState("error");
      settled.current?.(false);
      return false;
    } finally {
      if (abort.current === controller) abort.current = null;
    }
  }, []);

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      try {
        const latest = await fetchLatestAnalysis(projectId);
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

  // Retoma un análisis que sigue corriendo en el servidor. Si la consulta falla, no se insiste:
  // el aviso de "análisis en curso" de la página sigue disponible.
  useEffect(() => {
    let cancelled = false;
    void findRunningAnalysis(projectId)
      .then((running) => {
        if (!running || cancelled) return;
        void follow(
          (signal) => waitForAnalysis(projectId, running.id, { signal }),
          new Date(running.createdAt).getTime(),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [projectId, follow]);

  /** Devuelve true si el análisis terminó bien. */
  const analyze = useCallback(
    () => follow((signal) => requestAnalysis(projectId, { signal }), Date.now()),
    [projectId, follow],
  );

  return {
    analysis,
    hasAnalysis: analysis !== null,
    isLoading,
    error,
    reload,
    analyze,
    analyzeState,
    isAnalyzing: analyzeState === "analyzing",
    analyzingSince,
    analyzeError,
  };
}
