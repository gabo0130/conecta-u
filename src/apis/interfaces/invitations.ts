/** RF21–RF22: convocatorias por correo (contrato de `POST/GET /projects/:id/invitations`). */
export type InvitationStatus = "ENVIADA" | "FALLIDA";
export type InvitationSkipReason = "YA_CONVOCADA" | "SIN_AUTORIZACION" | "INACTIVA";

export interface Invitation {
  id: string;
  collaboratorId: string | null;
  requiredProfileId: string | null;
  profileName: string | null;
  recipientName: string;
  /** Enmascarado para el líder (`an***@ufps.edu.co`); completo para el ADMIN. */
  recipientEmail: string;
  status: InvitationStatus;
  errorMessage: string | null;
  sentAt: string;
}

export interface InvitationsResponse {
  projectId: string;
  invitations: Invitation[];
}

export interface SendInvitationsPayload {
  collaboratorIds: string[];
  requiredProfileId?: string;
  message: string;
}

export interface SendInvitationsResult {
  sent: number;
  failed: number;
  skipped: { collaboratorId: string; name: string; reason: InvitationSkipReason; message: string }[];
  invitations: Invitation[];
}

export const INVITATION_LIMITS = { maxRecipients: 20, messageMin: 20, messageMax: 2000 } as const;
