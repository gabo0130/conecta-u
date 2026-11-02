"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { Need, OpportunityDraft } from "@/apis/interfaces/needs";
import type { Project, ProjectPayload } from "@/apis/interfaces/projects";
import { getErrorMessage } from "@/utils/get-error-message";

/**
 * Convertir una necesidad en oportunidad (T5): trae el borrador que arma el backend desde la
 * caracterización y envía el formulario de proyecto a `POST /needs/:id/opportunity`.
 */
export function useOpportunityDraft(needId: string) {
  const [draft, setDraft] = useState<OpportunityDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<OpportunityDraft>(`/needs/${needId}/opportunity-draft`);
      setDraft(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo preparar el proyecto desde la necesidad."));
    } finally {
      setIsLoading(false);
    }
  }, [needId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const convert = async (payload: ProjectPayload) => {
    setIsSaving(true);
    try {
      const response = await apiClient.post<{ need: Need; project: Project }>(
        `/needs/${needId}/opportunity`,
        payload,
      );
      return response.data;
    } finally {
      setIsSaving(false);
    }
  };

  return { draft, isLoading, error, reload, convert, isSaving };
}
