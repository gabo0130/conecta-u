"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { Project, ProjectListResponse } from "@/apis/interfaces/projects";
import { getErrorMessage } from "@/utils/get-error-message";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<ProjectListResponse>("/projects");
      setProjects(response.data.projects);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los proyectos."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { projects, isLoading, error, reload };
}
