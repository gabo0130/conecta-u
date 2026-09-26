"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { Program, ProgramsResponse } from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";

export function useProgramsCatalog() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<ProgramsResponse>("/catalogs/programs");
      setPrograms(response.data.programs);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los programas."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { programs, isLoading, error, reload };
}
