"use client";

import { useState } from "react";
import { apiClient } from "@/apis/client";
import type { Project, ProjectPayload } from "@/apis/interfaces/projects";

export function useCreateProject() {
  const [isSaving, setIsSaving] = useState(false);

  const createProject = async (payload: ProjectPayload) => {
    setIsSaving(true);
    try {
      const response = await apiClient.post<Project>("/projects", payload);
      return response.data;
    } finally {
      setIsSaving(false);
    }
  };

  return { createProject, isSaving };
}
