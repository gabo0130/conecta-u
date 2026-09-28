"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { Project } from "@/apis/interfaces/projects";
import { getErrorMessage } from "@/utils/get-error-message";

export function useProjectDetail(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await apiClient.get<Project>(`/projects/${id}`);
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

  return { project, setProject, isLoading, error };
}
