"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { RecommendationDetail } from "@/apis/interfaces/recommendations";
import { getErrorMessage } from "@/utils/get-error-message";

/** Desglose de una recomendación (RF17): habilidades, experiencia, disponibilidad, semántica y pesos. */
export function useRecommendationDetail(projectId: string, recommendationId: string) {
  const [detail, setDetail] = useState<RecommendationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<RecommendationDetail>(
        `/projects/${projectId}/recommendations/${recommendationId}`,
      );
      setDetail(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el detalle de la recomendación."));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, recommendationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { detail, isLoading, error, reload };
}
