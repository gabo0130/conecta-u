"use client";

import { isCancel } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/apis/client";
import type { PlatformStats, StatsFilters } from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

/** Solo los filtros con valor: un filtro vacío no viaja en la URL. */
export function toStatsParams(filters: StatsFilters): Record<string, string> {
  return Object.fromEntries(Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])));
}

/**
 * RF15 (HU-14): indicadores del dashboard del ADMIN, calculados por el backend (`GET /admin/stats`)
 * con los filtros elegidos. Al cambiar un filtro conserva los datos anteriores mientras recalcula
 * (`isRefreshing`) y cancela la petición anterior, para que una respuesta vieja no pise la nueva.
 */
export function usePlatformStats(filters: StatsFilters = {}) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const key = JSON.stringify(toStatsParams(filters));
  const params = useMemo(() => JSON.parse(key) as Record<string, string>, [key]);
  const inFlight = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setIsRefreshing(true);
    try {
      const response = await apiClient.get<PlatformStats>("/admin/stats", { params, signal: controller.signal });
      setStats(response.data);
      setError("");
    } catch (err) {
      if (isCancel(err)) return;
      setError(getErrorMessage(err, "No se pudieron cargar las estadísticas."));
    } finally {
      if (inFlight.current === controller) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [params]);

  useEffect(() => {
    void reload();
    return () => inFlight.current?.abort();
  }, [reload]);

  return { stats, isLoading, isRefreshing, error, reload };
}
