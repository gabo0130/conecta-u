"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  CreateProjectTypePayload,
  ProjectType,
  ProjectTypesResponse,
  UpdateProjectTypePayload,
} from "@/apis/interfaces/catalogs";
import { projectTypesRequest } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { getErrorMessage } from "@/utils/get-error-message";

/** ADMIN: catálogo de tipos de proyecto, incluidos los inactivos (RF7/RF22). */
export function useAdminProjectTypes() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ProjectTypesResponse>("/admin/catalogs/project-types");
      setProjectTypes(response.data.projectTypes);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los tipos de proyecto."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = async (request: () => Promise<unknown>) => {
    await request();
    projectTypesRequest.clear();
    await reload();
  };

  return {
    projectTypes,
    isLoading,
    error,
    reload,
    createProjectType: (payload: CreateProjectTypePayload) =>
      mutate(() => apiClient.post("/admin/catalogs/project-types", payload)),
    updateProjectType: (id: string, payload: UpdateProjectTypePayload) =>
      mutate(() => apiClient.patch(`/admin/catalogs/project-types/${id}`, payload)),
  };
}
