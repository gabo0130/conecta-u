"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { EvaluationSummary } from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

/** Tesis (D6): tasa de aceptación de las recomendaciones, global y por proyecto. */
export function useEvaluationSummary() {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<EvaluationSummary>("/admin/evaluation");
      setSummary(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar la evaluación del recomendador."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, isLoading, error, reload };
}
