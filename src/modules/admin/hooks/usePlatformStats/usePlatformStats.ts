"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { PlatformStats } from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

/** RF15: indicadores del dashboard del ADMIN, calculados por el backend (`GET /admin/stats`). */
export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<PlatformStats>("/admin/stats");
      setStats(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar las estadísticas."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, isLoading, error, reload };
}
