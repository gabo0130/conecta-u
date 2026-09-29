"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  CreateProgramPayload,
  Program,
  ProgramsResponse,
  UpdateProgramPayload,
} from "@/apis/interfaces/catalogs";
import { programsRequest } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { getErrorMessage } from "@/utils/get-error-message";

/** ADMIN: catálogo de programas académicos, incluidos los inactivos (RF22). */
export function useAdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ProgramsResponse>("/admin/catalogs/programs");
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

  const mutate = async (request: () => Promise<unknown>) => {
    await request();
    // El selector de programas de toda la app usa este mismo catálogo: se invalida para que
    // registro, perfil y proyectos vean el cambio sin recargar la pestaña.
    programsRequest.clear();
    await reload();
  };

  return {
    programs,
    isLoading,
    error,
    reload,
    createProgram: (payload: CreateProgramPayload) => mutate(() => apiClient.post("/admin/catalogs/programs", payload)),
    updateProgram: (id: string, payload: UpdateProgramPayload) =>
      mutate(() => apiClient.patch(`/admin/catalogs/programs/${id}`, payload)),
  };
}
