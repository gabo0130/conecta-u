"use client";

import { useCallback, useEffect, useState } from "react";
import type { SharedRequest } from "@/apis/shared-request";
import { getErrorMessage } from "@/utils/get-error-message";

/**
 * Carga un catálogo desde una petición compartida (`createSharedRequest`). `request` y `select`
 * deben definirse fuera del componente para que no cambien en cada render.
 */
export function useSharedCatalog<R, T>(request: SharedRequest<R>, select: (data: R) => T[], errorMessage: string) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (refresh: boolean, isCancelled: () => boolean = () => false) => {
      try {
        const data = await request.get({ refresh });
        if (isCancelled()) return;
        setItems(select(data));
        setError("");
      } catch (err) {
        if (!isCancelled()) setError(getErrorMessage(err, errorMessage));
      } finally {
        if (!isCancelled()) setIsLoading(false);
      }
    },
    [request, select, errorMessage],
  );

  useEffect(() => {
    let cancelled = false;
    void load(false, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  const reload = useCallback(() => load(true), [load]);

  return { items, isLoading, error, reload };
}
