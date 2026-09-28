"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { ImportRunSummary, ImportRunsResponse } from "@/apis/interfaces/admin";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { getErrorMessage } from "@/utils/get-error-message";

const PAGE_SIZE = 20;

/** ADMIN: historial de importaciones de colaboradores, más reciente primero. */
export function useImportRuns() {
  const [runs, setRuns] = useState<ImportRunSummary[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ImportRunsResponse>("/admin/import/collaborators/runs", {
        params: { page, pageSize: PAGE_SIZE },
      });
      setRuns(response.data.runs);
      setMeta(response.data.meta);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el historial de importaciones."));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { runs, meta, page, setPage, isLoading, error, reload };
}
