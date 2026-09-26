"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { AdminCollaboratorSummary, AdminCollaboratorsResponse } from "@/apis/interfaces/admin";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { getErrorMessage } from "@/utils/get-error-message";

const PAGE_SIZE = 20;

/** ADMIN: todas las personas con perfil técnico, con o sin usuario. */
export function useAdminCollaborators() {
  const [collaborators, setCollaborators] = useState<AdminCollaboratorSummary[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<AdminCollaboratorsResponse>("/admin/collaborators", {
        params: { page, pageSize: PAGE_SIZE },
      });
      setCollaborators(response.data.collaborators);
      setMeta(response.data.meta);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los colaboradores."));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { collaborators, meta, page, setPage, isLoading, error, reload };
}
