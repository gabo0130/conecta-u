"use client";

import { useState } from "react";
import type { Collaborator, UpdateCollaboratorPayload } from "@/apis/interfaces/collaborator";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import {
  optionalInteger,
  PROFILE_URL_MAX_LENGTH,
  SEMESTER,
  validateInteger,
  validateProfileUrl,
} from "@/modules/collaborator/utils/collaborator-limits";
import { DATA_CONSENT_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import { Checkbox, Input, Modal, Select, Textarea } from "../../atoms";
import { clean, optionalText, useProfileSubmit, type SubmitFn } from "./useProfileSubmit";

type EditProfileModalProps = {
  collaborator: Collaborator;
  onSubmit: SubmitFn<UpdateCollaboratorPayload>;
  onClose: () => void;
};

export function EditProfileModal({ collaborator, onSubmit, onClose }: EditProfileModalProps) {
  const { programs, isLoading: isLoadingPrograms, error: programsError } = useProgramsCatalog();
  const [firstName, setFirstName] = useState(collaborator.firstName);
  const [lastName, setLastName] = useState(collaborator.lastName);
  const [programId, setProgramId] = useState(collaborator.programId);
  const [semester, setSemester] = useState(collaborator.semester?.toString() ?? "");
  const [researchGroup, setResearchGroup] = useState(collaborator.researchGroup ?? "");
  const [summary, setSummary] = useState(collaborator.summary ?? "");
  const [profileUrl, setProfileUrl] = useState(collaborator.profileUrl ?? "");
  const [dataConsent, setDataConsent] = useState(collaborator.dataConsent);
  const { isSubmitting, error, run, failWith } = useProfileSubmit();

  const handleSubmit = () => {
    if (
      failWith(
        !clean(firstName) || !clean(lastName) ? "Nombres y apellidos son obligatorios." : null,
        validateInteger(semester, SEMESTER, { label: "El semestre", required: false }),
        validateProfileUrl(profileUrl),
      )
    ) {
      return;
    }
    // Los campos opcionales vacíos se envían como null para que se borren (antes quedaba el valor viejo).
    void run(
      () =>
        onSubmit({
          firstName: clean(firstName),
          lastName: clean(lastName),
          programId,
          semester: optionalInteger(semester),
          researchGroup: optionalText(researchGroup),
          summary: optionalText(summary),
          profileUrl: optionalText(profileUrl),
          dataConsent,
        }),
      onClose,
      "Tus datos se actualizaron.",
    );
  };

  return (
    <Modal title="Editar perfil" onClose={onClose} isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit}>
      <Input label="Nombres" maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
      <Input label="Apellidos" maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} />
      <Select
        label="Programa"
        options={
          isLoadingPrograms
            ? [{ value: programId, label: "Cargando programas…" }]
            : programs.map((program) => ({ value: program.id, label: program.name }))
        }
        value={programId}
        onChange={(event) => setProgramId(event.target.value)}
        isLoading={isLoadingPrograms}
        error={programsError || undefined}
      />
      <Input
        label="Semestre (opcional)"
        type="number"
        min={SEMESTER.min}
        max={SEMESTER.max}
        helperText="Déjalo vacío si no aplica (docentes)."
        value={semester}
        onChange={(event) => setSemester(event.target.value)}
      />
      <Input
        label="Grupo de investigación / semillero (opcional)"
        placeholder="Ej. Semillero de Software"
        maxLength={160}
        value={researchGroup}
        onChange={(event) => setResearchGroup(event.target.value)}
      />
      <Textarea label="Resumen (opcional)" rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} />
      <Input
        label="Enlace de portafolio (opcional)"
        type="url"
        placeholder="https://github.com/tu-usuario"
        helperText="GitHub, portafolio, LinkedIn o CvLAC."
        maxLength={PROFILE_URL_MAX_LENGTH}
        value={profileUrl}
        onChange={(event) => setProfileUrl(event.target.value)}
      />
      <Checkbox label={DATA_CONSENT_LABEL} checked={dataConsent} onChange={(event) => setDataConsent(event.target.checked)} />
    </Modal>
  );
}
