"use client";

import { useEffect, useState } from "react";
import { fetchAllPages } from "@/apis/fetch-all-pages";
import type { PageParams } from "@/apis/fetch-all-pages";
import { getErrorMessage } from "@/utils/get-error-message";

type Result<T> = { signature: string; items: T[] } | { signature: string; error: string };

/**
 * Todos los elementos de un listado paginado, cargados solo cuando `enabled` pasa a true
 * (al buscar, filtrar u ordenar). Se guardan por combinación de `params` (que debe ser estable:
 * memorizado o constante). Mientras llega una carga nueva se siguen entregando los últimos
 * elementos (`items`), para no desmontar la tabla; `invalidate()` vuelve a pedirlos tras guardar.
 */
export function useAllPages<T>(url: string, key: string, enabled: boolean, errorMessage: string, params?: PageParams) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const [lastItems, setLastItems] = useState<T[] | null>(null);
  const signature = JSON.stringify([url, key, params ?? {}, version]);
  const current = result?.signature === signature ? result : null;

  useEffect(() => {
    if (!enabled || current) return;
    const controller = new AbortController();
    fetchAllPages<T>(url, key, params, controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return;
        setResult({ signature, items });
        setLastItems(items);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setResult({ signature, error: getErrorMessage(err, errorMessage) });
      });
    return () => controller.abort();
  }, [enabled, current, signature, url, key, params, errorMessage]);

  return {
    /** Los de la carga actual o, mientras llega, los de la anterior. */
    items: current && "items" in current ? current.items : (lastItems ?? []),
    /** Hay algo que mostrar (aunque sea de la carga anterior). */
    hasItems: lastItems !== null,
    isLoading: enabled && !current,
    error: current && "error" in current ? current.error : "",
    invalidate: () => setVersion((value) => value + 1),
  };
}
