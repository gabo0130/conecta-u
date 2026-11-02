"use client";

import { useState } from "react";
import { INVITATION_LIMITS, type SendInvitationsPayload, type SendInvitationsResult } from "@/apis/interfaces/invitations";
import { defaultInvitationMessage, summarizeSend } from "@/modules/invitations/utils/invitation-view";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Modal, Textarea } from "../../atoms";
import styles from "./InvitationModal.module.css";

type InvitationModalProps = {
  projectTitle: string;
  profile: { id: string; name: string };
  recipients: { id: string; fullName: string }[];
  onSend: (payload: SendInvitationsPayload) => Promise<SendInvitationsResult>;
  onSent: () => void;
  onClose: () => void;
};

/**
 * RF21 (HU-18): el líder escribe la convocatoria y la envía por correo a las personas marcadas.
 * El correo de cada persona no se muestra: el backend lo resuelve y la respuesta le llega al líder.
 */
export function InvitationModal({ projectTitle, profile, recipients, onSend, onSent, onClose }: InvitationModalProps) {
  const [message, setMessage] = useState(() => defaultInvitationMessage(projectTitle, profile.name));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const length = message.trim().length;

  const handleSubmit = async () => {
    if (length < INVITATION_LIMITS.messageMin) {
      setError(`El mensaje debe tener al menos ${INVITATION_LIMITS.messageMin} caracteres.`);
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const result = await onSend({
        collaboratorIds: recipients.map((recipient) => recipient.id),
        requiredProfileId: profile.id,
        message: message.trim(),
      });
      onSent();
      onClose();
      const summary = summarizeSend(result);
      void (summary.tone === "success"
        ? notify.success(summary.message)
        : notify.warning(summary.message, { title: "Convocatoria enviada con observaciones" }));
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo enviar la convocatoria."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      width="wide"
      title="Convocar por correo"
      submitLabel={`Enviar a ${recipients.length} ${recipients.length === 1 ? "persona" : "personas"}`}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() => void handleSubmit()}
    >
      <p className={styles.intro}>
        Perfil <b>{profile.name}</b> del proyecto <b>{projectTitle}</b>. Cada persona recibe un correo con el resumen del
        proyecto y tu mensaje; si responde, la respuesta te llega a tu correo.
      </p>
      <ul className={styles.recipients} aria-label="Destinatarios">
        {recipients.map((recipient) => (
          <li key={recipient.id} className={styles.recipient}>
            {recipient.fullName}
          </li>
        ))}
      </ul>
      <Textarea
        label="Mensaje"
        rows={7}
        maxLength={INVITATION_LIMITS.messageMax}
        helperText={`${length} / ${INVITATION_LIMITS.messageMax} caracteres. No incluyas datos personales de otras personas.`}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <p className={styles.note}>
        Solo se convoca a personas recomendadas con autorización de datos vigente. A quien ya se convocó para este
        proyecto en las últimas 24 horas no se le vuelve a enviar.
      </p>
    </Modal>
  );
}
