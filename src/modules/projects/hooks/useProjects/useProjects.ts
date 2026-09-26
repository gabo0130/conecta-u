"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { Project, ProjectListResponse } from "@/apis/interfaces/projects";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { getErrorMessage } from "@/utils/get-error-message";

const PAGE_SIZE = 20;

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ProjectListResponse>("/projects", {
        params: { page, pageSize: PAGE_SIZE },
      });
      setProjects(response.data.projects);
      setMeta(response.data.meta);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los proyectos."));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { projects, meta, page, setPage, isLoading, error, reload };
}
