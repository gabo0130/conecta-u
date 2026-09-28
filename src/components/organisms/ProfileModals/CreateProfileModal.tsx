"use client";

import { useState } from "react";
import type { PersonType } from "@/apis/interfaces/auth";
import type { CreateCollaboratorPayload } from "@/apis/interfaces/collaborator";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { DATA_CONSENT_LABEL, PERSON_TYPE_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import { Checkbox, Input, Modal, Select } from "../../atoms";
import { clean, useProfileSubmit, type SubmitFn } from "./useProfileSubmit";

type CreateProfileModalProps = {
  onSubmit: SubmitFn<CreateCollaboratorPayload>;
  onClose: () => void;
};

/** El LIDER crea su propio perfil técnico (RF3). */
export function CreateProfileModal({ onSubmit, onClose }: CreateProfileModalProps) {
  const { programs, isLoading: isLoadingPrograms, error: programsError } = useProgramsCatalog();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personType, setPersonType] = useState<PersonType>("DOCENTE");
  const [programId, setProgramId] = useState("");
  const [dataConsent, setDataConsent] = useState(false);
  const { isSubmitting, error, run, failWith } = useProfileSubmit();

  const handleSubmit = () => {
    if (
      failWith(
        !clean(firstName) || !clean(lastName) ? "Nombres y apellidos son obligatorios." : null,
        !programId ? "Selecciona un programa." : null,
        !dataConsent ? "Debes autorizar el tratamiento de tus datos para crear tu perfil técnico." : null,
      )
    ) {
      return;
    }
    void run(
      () => onSubmit({ firstName: clean(firstName), lastName: clean(lastName), personType, programId, dataConsent }),
      onClose,
      "Tu perfil de colaborador quedó creado.",
    );
  };

  return (
    <Modal
      title="Crear mi perfil de colaborador"
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Crear perfil"
    >
      <Input label="Nombres" maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
      <Input label="Apellidos" maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} />
      <Select
        label="Tipo de persona"
        options={PERSON_TYPE_OPTIONS}
        value={personType}
        onValueChange={setPersonType}
      />
      <Select
        label="Programa"
        options={[
          { value: "", label: isLoadingPrograms ? "Cargando programas…" : "Selecciona un programa" },
          ...programs.map((program) => ({ value: program.id, label: program.name })),
        ]}
        value={programId}
        onChange={(event) => setProgramId(event.target.value)}
        isLoading={isLoadingPrograms}
        error={programsError || undefined}
      />
      <Checkbox label={DATA_CONSENT_LABEL} checked={dataConsent} onChange={(event) => setDataConsent(event.target.checked)} />
    </Modal>
  );
}
