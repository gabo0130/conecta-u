"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { Project } from "@/apis/interfaces/projects";
import { getErrorMessage } from "@/utils/get-error-message";

export function useProjectDetail(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Recargar no vuelve a mostrar "cargando": el proyecto ya visible se reemplaza al llegar el nuevo.
  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
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

  return { project, setProject, isLoading, error, reload };
}
