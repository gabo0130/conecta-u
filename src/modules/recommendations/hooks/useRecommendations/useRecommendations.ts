"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AI_REQUEST_CONFIG, apiClient } from "@/apis/client";
import type { GenerateRecommendationsPayload, RecommendationsResponse } from "@/apis/interfaces/recommendations";
import { getErrorMessage } from "@/utils/get-error-message";

/**
 * Recomendaciones del proyecto por perfil requerido (RF15–RF16). El GET siempre responde 200: si
 * nunca se generaron, `generatedAt` es null y cada perfil trae una lista vacía.
 * `includeUnavailable` filtra la vista y se manda también al generar.
 */
export function useRecommendations(projectId: string) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [includeUnavailable, setIncludeUnavailable] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // Al cambiar el filtro rápido, una respuesta vieja que llegue tarde no debe pisar a la nueva.
  const lastRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++lastRequest.current;
    setIsLoading(true);
    try {
      const response = await apiClient.get<RecommendationsResponse>(`/projects/${projectId}/recommendations`, {
        params: { includeUnavailable },
      });
      if (requestId !== lastRequest.current) return;
      setData(response.data);
      setError("");
    } catch (err) {
      if (requestId !== lastRequest.current) return;
      setError(getErrorMessage(err, "No se pudieron cargar las recomendaciones."));
    } finally {
      if (requestId === lastRequest.current) setIsLoading(false);
    }
  }, [projectId, includeUnavailable]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Reemplaza todas las recomendaciones del proyecto. Propaga el error (409 sin análisis o sin perfiles). */
  const generate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const payload: GenerateRecommendationsPayload = { includeUnavailable };
      const response = await apiClient.post<RecommendationsResponse>(
        `/projects/${projectId}/recommendations`,
        payload,
        AI_REQUEST_CONFIG,
      );
      // Invalida cualquier GET en vuelo: la respuesta del POST ya es el estado nuevo.
      lastRequest.current++;
      setData(response.data);
      setError("");
      setIsLoading(false);
      return response.data;
    } finally {
      setIsGenerating(false);
    }
  }, [projectId, includeUnavailable]);

  return {
    recommendations: data,
    profiles: data?.profiles ?? [],
    generatedAt: data?.generatedAt ?? null,
    isLoading,
    error,
    reload,
    includeUnavailable,
    setIncludeUnavailable,
    generate,
    isGenerating,
  };
}
