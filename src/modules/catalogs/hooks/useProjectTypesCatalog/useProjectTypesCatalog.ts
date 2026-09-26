"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { ProjectType, ProjectTypesResponse } from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";

export function useProjectTypesCatalog() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<ProjectTypesResponse>("/catalogs/project-types");
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

  return { projectTypes, isLoading, error, reload };
}
