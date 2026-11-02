"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  AdminCollaboratorDetail,
  UpdateIdentificationPayload,
  UpdatePersonProfilePayload,
} from "@/apis/interfaces/admin";
import { viewCertificateAt } from "@/modules/collaborator/hooks/useCollaborator/useCollaborator";
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

  /** v2.1: el ADMIN corrige identificación y contacto, incluido el documento. */
  const updateIdentification = useCallback(
    async (payload: UpdateIdentificationPayload) => {
      const response = await apiClient.patch<AdminCollaboratorDetail>(`/admin/collaborators/${id}`, payload);
      setCollaborator(response.data);
    },
    [id],
  );

  /** RF17: corrige los datos de perfil. */
  const updateProfile = useCallback(
    async (payload: UpdatePersonProfilePayload) => {
      const response = await apiClient.patch<AdminCollaboratorDetail>(`/admin/collaborators/${id}/profile`, payload);
      setCollaborator(response.data);
    },
    [id],
  );

  /** RF17: dar de baja (`false`) o reactivar (`true`). */
  const setActive = useCallback(
    async (active: boolean) => {
      const response = await apiClient.patch<AdminCollaboratorDetail>(`/admin/collaborators/${id}/status`, { active });
      setCollaborator(response.data);
    },
    [id],
  );

  /** RF4 (v2.2, E8 / RT16): abre el certificado de una experiencia. */
  const viewCertificate = useCallback(
    (experienceId: string) => viewCertificateAt(`/admin/collaborators/${id}/experience/${experienceId}/certificate`),
    [id],
  );

  return { collaborator, isLoading, error, updateIdentification, updateProfile, setActive, viewCertificate };
}
