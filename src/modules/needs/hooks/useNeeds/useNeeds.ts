"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/apis/client";
import type { NeedListResponse, NeedSort, NeedStatus, NeedSummary } from "@/apis/interfaces/needs";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { getErrorMessage } from "@/utils/get-error-message";

const PAGE_SIZE = 20;

/** Necesidades: el LIDER ve las suyas y el ADMIN todas (lo decide el backend). Ordena el servidor. */
export function useNeeds() {
  const [needs, setNeeds] = useState<NeedSummary[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSortState] = useState<NeedSort>("priority");
  const [status, setStatusState] = useState<NeedStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Al cambiar orden o filtro rápido, una respuesta vieja que llegue tarde no pisa a la nueva.
  const lastRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++lastRequest.current;
    setIsLoading(true);
    try {
      const response = await apiClient.get<NeedListResponse>("/needs", {
        params: { page, pageSize: PAGE_SIZE, sort, ...(status ? { status } : {}) },
      });
      if (requestId !== lastRequest.current) return;
      setNeeds(response.data.needs);
      setMeta(response.data.meta);
      setError("");
    } catch (err) {
      if (requestId !== lastRequest.current) return;
      setError(getErrorMessage(err, "No se pudieron cargar las necesidades."));
    } finally {
      if (requestId === lastRequest.current) setIsLoading(false);
    }
  }, [page, sort, status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Cambiar el orden o el filtro vuelve a la primera página.
  const setSort = (next: NeedSort) => {
    setSortState(next);
    setPage(1);
  };
  const setStatus = (next: NeedStatus | "") => {
    setStatusState(next);
    setPage(1);
  };

  return { needs, meta, page, setPage, sort, setSort, status, setStatus, isLoading, error, reload };
}
