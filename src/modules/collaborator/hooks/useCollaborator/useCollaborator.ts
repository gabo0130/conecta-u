"use client";

import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  AvailabilityPayload,
  Collaborator,
  Experience,
  CollaboratorSkillPayload,
  ExperiencePayload,
  UpdateCollaboratorPayload,
} from "@/apis/interfaces/collaborator";
import { getErrorMessage } from "@/utils/get-error-message";
import { fileNameFromDisposition, openBlob } from "@/utils/open-blob";

const certificateUrl = (experienceId: string) => `/collaborators/me/experience/${experienceId}/certificate`;

/**
 * Cuerpo de crear o editar una experiencia: JSON, o multipart con `data` (el JSON) y `file`
 * cuando lleva certificado. La API guarda ambos juntos o ninguno.
 */
export function experienceRequest(payload: ExperiencePayload, certificate: File | null) {
  if (!certificate) return { body: payload as ExperiencePayload | FormData, config: undefined };
  const form = new FormData();
  form.append("data", JSON.stringify(payload));
  form.append("file", certificate);
  return { body: form, config: { headers: { "Content-Type": "multipart/form-data" } } };
}

/** Sube el certificado (multipart, campo `file`). */
export function uploadCertificate(url: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiClient.put<Experience>(url, form, { headers: { "Content-Type": "multipart/form-data" } });
}

/** Descarga un certificado con el token y lo abre en otra pestaña. */
export async function viewCertificateAt(url: string, fallbackName = "certificado") {
  const response = await apiClient.get<Blob>(url, { responseType: "blob" });
  const disposition = response.headers["content-disposition"];
  openBlob(response.data, fileNameFromDisposition(typeof disposition === "string" ? disposition : undefined, fallbackName));
}

export function useCollaborator() {
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  // `silent`: recarga tras guardar sin volver al estado "cargando" (evita que la página parpadee
  // y que se desmonte el modal abierto).
  const reload = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setIsLoading(true);
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
    await reload({ silent: true });
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
    /**
     * RF4 (v2.2, E8): crea o actualiza la experiencia con su certificado en una sola petición;
     * si el archivo no es válido no se guarda nada.
     */
    saveExperience: (payload: ExperiencePayload, { id, certificate }: { id?: string; certificate: File | null }) =>
      mutate(() => {
        const { body, config } = experienceRequest(payload, certificate);
        return id
          ? apiClient.patch<Experience>(`/collaborators/me/experience/${id}`, body, config)
          : apiClient.post<Experience>("/collaborators/me/experience", body, config);
      }),
    deleteCertificate: (experienceId: string) => mutate(() => apiClient.delete(certificateUrl(experienceId))),
    viewCertificate: (experienceId: string) => viewCertificateAt(certificateUrl(experienceId)),
  };
}
