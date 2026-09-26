"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type { AdminCollaboratorDetail } from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

/** ADMIN: perfil técnico completo de una persona, su cuenta y los proyectos que lidera. */
export function useAdminCollaborator(id: string) {
  const [collaborator, setCollaborator] = useState<AdminCollaboratorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiClient.get<AdminCollaboratorDetail>(`/admin/collaborators/${id}`);
        if (!cancelled) setCollaborator(response.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "No se pudo cargar el perfil."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { collaborator, isLoading, error };
}
