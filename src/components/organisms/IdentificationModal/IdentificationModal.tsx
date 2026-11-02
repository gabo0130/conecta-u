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
import {
  TRUTHFULNESS_DECLARATION,
  TRUTHFULNESS_LABEL,
  TRUTHFULNESS_REQUIRED,
} from "@/modules/legal/legal-texts";
import { notify } from "@/utils/notify";
import { Modal } from "../../atoms";
import { IdentificationFields, LegalCheckbox } from "../../molecules";

type IdentificationModalProps = {
  person: Identification;
  /** Correo principal de la persona: el alterno debe ser distinto. */
  email: string;
  /** El ADMIN siempre; la propia persona solo si aún no tiene documento. */
  canChangeDocument: boolean;
  /**
   * v2.2, E2: en «Mi perfil» la persona declara la veracidad de lo que guarda (con su valor actual).
   * El ADMIN no la declara por ella: sin esta prop no aparece la casilla.
   */
  truthfulness?: { declared: boolean };
  onSubmit: (payload: Partial<IdentificationPayload> & { truthfulnessDeclared?: true }) => Promise<unknown>;
  onClose: () => void;
  successMessage: string;
};

/** Edita identificación y contacto (v2.1). El documento solo se envía si quien edita puede cambiarlo. */
export function IdentificationModal({
  person,
  email,
  canChangeDocument,
  truthfulness,
  onSubmit,
  onClose,
  successMessage,
}: IdentificationModalProps) {
  const [form, setForm] = useState<IdentificationForm>(() => toIdentificationForm(person));
  const [errors, setErrors] = useState<IdentificationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declared, setDeclared] = useState(truthfulness?.declared ?? false);

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
    if (truthfulness && !declared) {
      void notify.error(TRUTHFULNESS_REQUIRED);
      return;
    }

    const { documentType, documentNumber, ...contact } = toIdentificationPayload(form);
    const fields = canChangeDocument ? { documentType, documentNumber, ...contact } : contact;
    setIsSubmitting(true);
    try {
      await onSubmit(truthfulness ? { ...fields, truthfulnessDeclared: true } : fields);
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
      {truthfulness ? (
        <LegalCheckbox
          label={TRUTHFULNESS_LABEL}
          href={TRUTHFULNESS_DECLARATION.href}
          checked={declared}
          onChange={(event) => setDeclared(event.target.checked)}
          disabled={isSubmitting}
        />
      ) : null}
    </Modal>
  );
}
