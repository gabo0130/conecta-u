"use client";

import { useCallback, useState } from "react";
import { AI_REQUEST_CONFIG, apiClient, isTimeoutError } from "@/apis/client";
import type {
  CreateRequiredProfilePayload,
  RequiredProfile,
  UpdateRequiredProfilePayload,
} from "@/apis/interfaces/analysis";
import { ProfileTimeoutError } from "../../utils/analysis-view";

// El backend recalcula el embedding del perfil (Gemini) si cambian estos campos: esperan a la IA.
const EMBEDDING_FIELDS = ["name", "description", "skills"] as const;

function touchesEmbedding(payload: UpdateRequiredProfilePayload) {
  return EMBEDDING_FIELDS.some((field) => payload[field] !== undefined);
}

/**
 * Perfiles requeridos de un proyecto (RF13): crear uno manual, editar (también los de la IA) y
 * descartar. Tras cada cambio llama a `onChanged` para refrescar el análisis que los muestra.
 */
export function useRequiredProfiles(projectId: string, onChanged: () => Promise<unknown>) {
  const [isSaving, setIsSaving] = useState(false);
  const base = `/projects/${projectId}/required-profiles`;

  const mutate = useCallback(
    async (request: () => Promise<RequiredProfile>) => {
      setIsSaving(true);
      try {
        const profile = await request();
        await onChanged();
        return profile;
      } catch (error) {
        // Cortada por tiempo, el backend pudo terminar de guardar: se refresca la lista para que el
        // líder lo vea antes de reintentar (si no, crearía un perfil duplicado).
        if (isTimeoutError(error)) {
          await onChanged().catch(() => undefined);
          throw new ProfileTimeoutError();
        }
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [onChanged],
  );

  const createProfile = (payload: CreateRequiredProfilePayload) =>
    mutate(async () => (await apiClient.post<RequiredProfile>(base, payload, AI_REQUEST_CONFIG)).data);

  const updateProfile = (profileId: string, payload: UpdateRequiredProfilePayload) =>
    mutate(
      async () =>
        (
          await apiClient.patch<RequiredProfile>(
            `${base}/${profileId}`,
            payload,
            touchesEmbedding(payload) ? AI_REQUEST_CONFIG : undefined,
          )
        ).data,
    );

  const discardProfile = (profileId: string) => updateProfile(profileId, { active: false });

  return { createProfile, updateProfile, discardProfile, isSaving };
}
