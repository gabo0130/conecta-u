"use client";

import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { AI_REQUEST_CONFIG, apiClient } from "@/apis/client";
import type { Need, NeedPayload } from "@/apis/interfaces/needs";
import { getErrorMessage } from "@/utils/get-error-message";

/** Detalle de una necesidad y sus acciones: editar, caracterizar con IA y descartar. */
export function useNeed(id: string) {
  const [need, setNeed] = useState<Need | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCharacterizing, setIsCharacterizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Need>(`/needs/${id}`);
      setNeed(response.data);
      setError("");
    } catch (err) {
      // Un 404 (borrada o id inexistente) no es una falla de conexión: se dice tal cual.
      setError(
        isAxiosError(err) && err.response?.status === 404
          ? "No se encontró la necesidad."
          : getErrorMessage(err, "No se pudo cargar la necesidad."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** La IA puede tardar: usa el tiempo de espera largo de las peticiones de IA. */
  const characterize = async () => {
    setIsCharacterizing(true);
    try {
      const response = await apiClient.post<Need>(`/needs/${id}/characterization`, undefined, AI_REQUEST_CONFIG);
      setNeed(response.data);
      return response.data;
    } finally {
      setIsCharacterizing(false);
    }
  };

  const update = async (payload: Partial<NeedPayload>) => {
    setIsSaving(true);
    try {
      const response = await apiClient.patch<Need>(`/needs/${id}`, payload);
      setNeed(response.data);
      return response.data;
    } finally {
      setIsSaving(false);
    }
  };

  const discard = async (reason: string | null) => {
    const response = await apiClient.post<Need>(`/needs/${id}/discard`, { reason });
    setNeed(response.data);
    return response.data;
  };

  return { need, isLoading, error, reload, characterize, isCharacterizing, update, isSaving, discard };
}
