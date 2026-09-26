"use client";

import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  AvailabilityPayload,
  Collaborator,
  CollaboratorSkillPayload,
  ExperiencePayload,
  UpdateCollaboratorPayload,
} from "@/apis/interfaces/collaborator";
import { getErrorMessage } from "@/utils/get-error-message";

export function useCollaborator() {
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Collaborator>("/collaborators/me");
      setCollaborator(response.data);
      setNotFound(false);
      setError("");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setCollaborator(null);
        setNotFound(true);
        setError("");
      } else {
        setError(getErrorMessage(err, "No se pudo cargar el perfil."));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Tras cada mutación se recarga el perfil completo para reflejar el estado del servidor.
  const mutate = async (request: () => Promise<unknown>) => {
    await request();
    await reload();
  };

  return {
    collaborator,
    isLoading,
    notFound,
    error,
    reload,
    updateProfile: (payload: UpdateCollaboratorPayload) =>
      mutate(() => apiClient.patch("/collaborators/me", payload)),
    updateAvailability: (payload: AvailabilityPayload) =>
      mutate(() => apiClient.patch("/collaborators/me/availability", payload)),
    addSkill: (payload: CollaboratorSkillPayload) =>
      mutate(() => apiClient.post("/collaborators/me/skills", payload)),
    updateSkill: (id: string, payload: CollaboratorSkillPayload) =>
      mutate(() => apiClient.patch(`/collaborators/me/skills/${id}`, payload)),
    deleteSkill: (id: string) =>
      mutate(() => apiClient.delete(`/collaborators/me/skills/${id}`)),
    addExperience: (payload: ExperiencePayload) =>
      mutate(() => apiClient.post("/collaborators/me/experience", payload)),
    updateExperience: (id: string, payload: ExperiencePayload) =>
      mutate(() => apiClient.patch(`/collaborators/me/experience/${id}`, payload)),
    deleteExperience: (id: string) =>
      mutate(() => apiClient.delete(`/collaborators/me/experience/${id}`)),
  };
}
