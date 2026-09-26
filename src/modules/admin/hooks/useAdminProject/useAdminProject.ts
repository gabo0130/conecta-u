"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { AdminProject } from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

/** ADMIN: detalle de cualquier proyecto con los datos de su líder. */
export function useAdminProject(id: string) {
  const [project, setProject] = useState<AdminProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiClient.get<AdminProject>(`/admin/projects/${id}`);
        if (!cancelled) setProject(response.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "No se pudo cargar el proyecto."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { project, isLoading, error };
}
