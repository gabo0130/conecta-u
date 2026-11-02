"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  Invitation,
  InvitationsResponse,
  SendInvitationsPayload,
  SendInvitationsResult,
} from "@/apis/interfaces/invitations";
import { getErrorMessage } from "@/utils/get-error-message";

/** RF21–RF22: convocatorias de un proyecto (historial y envío). */
export function useInvitations(projectId: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<InvitationsResponse>(`/projects/${projectId}/invitations`);
      setInvitations(response.data.invitations);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el historial de convocatorias."));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const send = async (payload: SendInvitationsPayload) => {
    const response = await apiClient.post<SendInvitationsResult>(`/projects/${projectId}/invitations`, payload);
    await reload();
    return response.data;
  };

  return { invitations, isLoading, error, reload, send };
}
