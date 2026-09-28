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

export function useUpdateProject(id: string) {
  const [isSaving, setIsSaving] = useState(false);

  const updateProject = async (payload: Partial<ProjectPayload>) => {
    setIsSaving(true);
    try {
      const response = await apiClient.patch<Project>(`/projects/${id}`, payload);
      return response.data;
    } finally {
      setIsSaving(false);
    }
  };

  return { updateProject, isSaving };
}
