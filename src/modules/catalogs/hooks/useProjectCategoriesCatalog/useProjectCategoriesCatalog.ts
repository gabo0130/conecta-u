"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  ProjectCategoriesResponse,
  ProjectCategory,
} from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";

export function useProjectCategoriesCatalog() {
  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<ProjectCategoriesResponse>(
        "/catalogs/project-categories",
      );
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

  return { projectCategories, isLoading, error, reload };
}
