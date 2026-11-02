"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SharedRequest } from "@/apis/shared-request";
import { getErrorMessage } from "@/utils/get-error-message";
import { getServiceState, subscribeServiceStatus } from "@/utils/service-status";

/**
 * Carga un catálogo desde una petición compartida (`createSharedRequest`). `request` y `select`
 * deben definirse fuera del componente para que no cambien en cada render.
 * Si quedó con error y luego el servidor vuelve a responder, se recarga solo: así un select no se
 * queda vacío por haber abierto la pantalla mientras el backend despertaba.
 */
export function useSharedCatalog<R, T>(request: SharedRequest<R>, select: (data: R) => T[], errorMessage: string) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasError = useRef(false);

  const load = useCallback(
    async (refresh: boolean, isCancelled: () => boolean = () => false) => {
      try {
        const data = await request.get({ refresh });
        if (isCancelled()) return;
        setItems(select(data));
        setError("");
        hasError.current = false;
      } catch (err) {
        if (isCancelled()) return;
        setError(getErrorMessage(err, errorMessage));
        hasError.current = true;
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

  useEffect(() => {
    let cancelled = false;
    let previous = getServiceState().status;
    const unsubscribe = subscribeServiceStatus(() => {
      const { status } = getServiceState();
      if (status === "online" && previous !== "online" && hasError.current) {
        setIsLoading(true);
        void load(true, () => cancelled);
      }
      previous = status;
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [load]);

  const reload = useCallback(() => load(true), [load]);

  return { items, isLoading, error, reload };
}
