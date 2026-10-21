"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { AdminProject } from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

/** ADMIN: detalle de cualquier proyecto con los datos de su líder. */
export function useAdminProject(id: string) {
  const [project, setProject] = useState<AdminProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<AdminProject>(`/admin/projects/${id}`);
      setProject(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el proyecto."));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { project, isLoading, error, reload };
}
