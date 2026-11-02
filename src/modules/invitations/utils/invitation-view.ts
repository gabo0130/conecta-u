import type { BadgeTone } from "@/components/atoms/Badge/Badge";
import type { Invitation, InvitationStatus, SendInvitationsResult } from "@/apis/interfaces/invitations";

export const INVITATION_STATUS_VIEW: Record<InvitationStatus, { label: string; tone: BadgeTone }> = {
  ENVIADA: { label: "Enviada", tone: "green" },
  FALLIDA: { label: "Fallida", tone: "red" },
};

const SHORT_DATE: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

/** Última convocatoria enviada con éxito a cada persona (para marcarla en la lista). */
export function lastSentByPerson(invitations: Invitation[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const invitation of invitations) {
    if (invitation.status !== "ENVIADA" || !invitation.collaboratorId) continue;
    const previous = result.get(invitation.collaboratorId);
    if (!previous || previous < invitation.sentAt) result.set(invitation.collaboratorId, invitation.sentAt);
  }
  return result;
}

export function invitedLabel(sentAt: string | undefined) {
  return sentAt ? `Convocada el ${new Date(sentAt).toLocaleDateString("es-CO", SHORT_DATE)}` : null;
}

/** Mensaje inicial: el líder lo ajusta antes de enviar. */
export function defaultInvitationMessage(projectTitle: string, profileName: string) {
  return [
    `Hola, te escribo porque tu perfil coincide con lo que buscamos para el perfil «${profileName}» del proyecto «${projectTitle}».`,
    "",
    "Nos gustaría contar contigo. Si te interesa, responde este correo y te comparto los detalles (dedicación, fechas y próximos pasos).",
  ].join("\n");
}

/** Resumen honesto del envío para la notificación. */
export function summarizeSend(result: SendInvitationsResult) {
  const parts: string[] = [];
  if (result.sent > 0) parts.push(`Se ${result.sent === 1 ? "envió 1 convocatoria" : `enviaron ${result.sent} convocatorias`}.`);
  if (result.failed > 0) {
    parts.push(
      `${result.failed === 1 ? "1 no se pudo entregar" : `${result.failed} no se pudieron entregar`}: revisa el historial e inténtalo más tarde.`,
    );
  }
  for (const skipped of result.skipped) parts.push(`${skipped.name || "Una persona"}: ${skipped.message.toLowerCase()}.`);
  return {
    tone: result.failed > 0 || result.sent === 0 ? ("warning" as const) : ("success" as const),
    message: parts.join(" ") || "No se envió ninguna convocatoria.",
  };
}
