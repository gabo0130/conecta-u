"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  CreateProjectCategoryPayload,
  ProjectCategoriesResponse,
  ProjectCategory,
  UpdateProjectCategoryPayload,
} from "@/apis/interfaces/catalogs";
import { projectCategoriesRequest } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { getErrorMessage } from "@/utils/get-error-message";

/** ADMIN: catálogo de categorías de proyecto, incluidas las inactivas (RF22). */
export function useAdminProjectCategories() {
  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ProjectCategoriesResponse>("/admin/catalogs/project-categories");
      setProjectCategories(response.data.projectCategories);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar las categorías de proyecto."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = async (request: () => Promise<unknown>) => {
    await request();
    projectCategoriesRequest.clear();
    await reload();
  };

  return {
    projectCategories,
    isLoading,
    error,
    reload,
    createProjectCategory: (payload: CreateProjectCategoryPayload) =>
      mutate(() => apiClient.post("/admin/catalogs/project-categories", payload)),
    updateProjectCategory: (id: string, payload: UpdateProjectCategoryPayload) =>
      mutate(() => apiClient.patch(`/admin/catalogs/project-categories/${id}`, payload)),
  };
}
