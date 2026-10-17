"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { AnalysisHistoryResponse, AnalysisSummary } from "@/apis/interfaces/analysis";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { getErrorMessage } from "@/utils/get-error-message";

const HISTORY_PAGE_SIZE = 5;

/** Intentos de análisis del proyecto, del más reciente al más antiguo (incluye los fallidos). */
export function useAnalysisHistory(projectId: string) {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<AnalysisHistoryResponse>(`/projects/${projectId}/analyses`, {
        params: { page, pageSize: HISTORY_PAGE_SIZE },
      });
      setAnalyses(response.data.analyses);
      setMeta(response.data.meta);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el historial de análisis."));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { analyses, meta, setPage, isLoading, error, reload };
}
