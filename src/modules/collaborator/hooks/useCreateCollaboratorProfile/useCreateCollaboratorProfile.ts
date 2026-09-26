"use client";

import { useState } from "react";
import { apiClient } from "@/apis/client";
import type { Collaborator, CreateCollaboratorPayload } from "@/apis/interfaces/collaborator";

export function useCreateCollaboratorProfile() {
  const [isSaving, setIsSaving] = useState(false);

  const createProfile = async (payload: CreateCollaboratorPayload) => {
    setIsSaving(true);
    try {
      const response = await apiClient.post<Collaborator>("/collaborators/me", payload);
      return response.data;
    } finally {
      setIsSaving(false);
    }
  };

  return { createProfile, isSaving };
}
