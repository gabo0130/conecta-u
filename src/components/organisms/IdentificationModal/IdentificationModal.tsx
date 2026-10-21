"use client";

import { useState } from "react";
import type { Identification, IdentificationPayload } from "@/apis/interfaces/collaborator";
import {
  type IdentificationErrors,
  type IdentificationForm,
  hasErrors,
  toIdentificationForm,
  toIdentificationPayload,
  validateIdentification,
} from "@/modules/collaborator/utils/identification";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Modal } from "../../atoms";
import { IdentificationFields } from "../../molecules";

type IdentificationModalProps = {
  person: Identification;
  /** Correo principal de la persona: el alterno debe ser distinto. */
  email: string;
  /** El ADMIN siempre; la propia persona solo si aún no tiene documento. */
  canChangeDocument: boolean;
  onSubmit: (payload: Partial<IdentificationPayload>) => Promise<unknown>;
  onClose: () => void;
  successMessage: string;
};

/** Edita identificación y contacto (v2.1). El documento solo se envía si quien edita puede cambiarlo. */
export function IdentificationModal({
  person,
  email,
  canChangeDocument,
  onSubmit,
  onClose,
  successMessage,
}: IdentificationModalProps) {
  const [form, setForm] = useState<IdentificationForm>(() => toIdentificationForm(person));
  const [errors, setErrors] = useState<IdentificationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = <K extends keyof IdentificationForm>(field: K, value: IdentificationForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const found = validateIdentification(form, email);
    // Si no puede cambiar el documento, no se valida ni se envía.
    if (!canChangeDocument) delete found.documentNumber;
    setErrors(found);
    if (hasErrors(found)) return;

    const { documentType, documentNumber, ...contact } = toIdentificationPayload(form);
    setIsSubmitting(true);
    try {
      await onSubmit(canChangeDocument ? { documentType, documentNumber, ...contact } : contact);
      onClose();
      void notify.success(successMessage);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudieron guardar los datos de identificación."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Identificación y contacto"
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      width="wide"
    >
      <IdentificationFields
        value={form}
        onChange={update}
        errors={errors}
        disabled={isSubmitting}
        documentLocked={!canChangeDocument}
      />
    </Modal>
  );
}
