"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  AvailabilityPayload,
  ExperiencePayload,
  Profile,
  SkillPayload,
  UpdateProfilePayload,
} from "@/apis/interfaces/profile";
import { getErrorMessage } from "@/utils/get-error-message";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<Profile>("/profiles/me");
      setProfile(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el perfil."));
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
    profile,
    isLoading,
    error,
    updateProfile: (payload: UpdateProfilePayload) =>
      mutate(() => apiClient.patch("/profiles/me", payload)),
    updateAvailability: (payload: AvailabilityPayload) =>
      mutate(() => apiClient.patch("/profiles/me/availability", payload)),
    addSkill: (payload: SkillPayload) =>
      mutate(() => apiClient.post("/profiles/me/skills", payload)),
    updateSkill: (id: string, payload: SkillPayload) =>
      mutate(() => apiClient.patch(`/profiles/me/skills/${id}`, payload)),
    deleteSkill: (id: string) => mutate(() => apiClient.delete(`/profiles/me/skills/${id}`)),
    addExperience: (payload: ExperiencePayload) =>
      mutate(() => apiClient.post("/profiles/me/experience", payload)),
    updateExperience: (id: string, payload: ExperiencePayload) =>
      mutate(() => apiClient.patch(`/profiles/me/experience/${id}`, payload)),
    deleteExperience: (id: string) =>
      mutate(() => apiClient.delete(`/profiles/me/experience/${id}`)),
  };
}
