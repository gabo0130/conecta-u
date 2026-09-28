"use client";

import { useEffect, useState } from "react";
import { fetchAllPages } from "@/apis/fetch-all-pages";
import { getErrorMessage } from "@/utils/get-error-message";

/**
 * Todos los elementos de un listado paginado, cargados solo cuando `enabled` pasa a true
 * (al escribir una búsqueda o elegir un filtro). Se cargan una vez por pantalla.
 */
export function useAllPages<T>(url: string, key: string, enabled: boolean, errorMessage: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || items !== null) return;
    let cancelled = false;
    fetchAllPages<T>(url, key)
      .then((all) => {
        if (!cancelled) setItems(all);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, errorMessage));
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, items, url, key, errorMessage]);

  return { items: items ?? [], isLoading: enabled && items === null && !error, error };
}
