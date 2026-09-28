"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { ImportRunDetail } from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

/** ADMIN: detalle de una corrida de importación, con todas sus filas rechazadas. */
export function useImportRun(id: string) {
  const [run, setRun] = useState<ImportRunDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiClient.get<ImportRunDetail>(`/admin/import/collaborators/runs/${id}`);
        if (!cancelled) setRun(response.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "No se pudo cargar la importación."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { run, isLoading, error };
}
