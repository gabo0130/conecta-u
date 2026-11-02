"use client";

import { useState } from "react";
import type {
  AdminCollaboratorDetail,
  CreatePersonPayload,
  UpdatePersonProfilePayload,
} from "@/apis/interfaces/admin";
import type { PersonType } from "@/apis/interfaces/auth";
import type { AvailabilityStatus } from "@/apis/interfaces/collaborator";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import {
  COLLABORATOR_WEEKLY_HOURS,
  optionalInteger,
  SEMESTER,
  validateInteger,
} from "@/modules/collaborator/utils/collaborator-limits";
import { AVAILABILITY_OPTIONS, PERSON_TYPE_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import {
  hasErrors,
  type IdentificationErrors,
  type IdentificationForm,
  toIdentificationForm,
  toIdentificationPayload,
  validateIdentification,
} from "@/modules/collaborator/utils/identification";
import { DATA_CONSENT_LABEL, DATA_TREATMENT } from "@/modules/legal/legal-texts";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { FormRow, Input, Modal, Select, Textarea } from "../../atoms";
import { IdentificationFields, LegalCheckbox } from "../../molecules";

type PersonModalProps =
  | {
      /** RF17: registrar una persona sin cuenta. */
      mode: "create";
      onCreate: (payload: CreatePersonPayload) => Promise<{ firstName: string; lastName: string }>;
      onClose: () => void;
    }
  | {
      /** RF17: corregir el perfil de una persona existente. */
      mode: "edit";
      person: AdminCollaboratorDetail;
      onUpdate: (payload: UpdatePersonProfilePayload) => Promise<unknown>;
      onClose: () => void;
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const optional = (value: string) => value.trim() || null;

/** RF17 (HU-15): el ADMIN registra o corrige una persona; no crea cuenta de usuario. */
export function PersonModal(props: PersonModalProps) {
  const person = props.mode === "edit" ? props.person : null;
  const { programs, isLoading: isLoadingPrograms, error: programsError } = useProgramsCatalog();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState(person?.firstName ?? "");
  const [lastName, setLastName] = useState(person?.lastName ?? "");
  const [personType, setPersonType] = useState<PersonType>(person?.personType ?? "DOCENTE");
  const [programId, setProgramId] = useState(person?.programId ?? "");
  const [semester, setSemester] = useState(person?.semester?.toString() ?? "");
  const [researchGroup, setResearchGroup] = useState(person?.researchGroup ?? "");
  const [summary, setSummary] = useState(person?.summary ?? "");
  const [availability, setAvailability] = useState<AvailabilityStatus>(person?.availabilityStatus ?? "DISPONIBLE");
  const [weeklyHours, setWeeklyHours] = useState(person?.weeklyHours.toString() ?? "4");
  const [dataConsent, setDataConsent] = useState(false);
  const [identification, setIdentification] = useState<IdentificationForm>(() => toIdentificationForm());
  const [identificationErrors, setIdentificationErrors] = useState<IdentificationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateIdentification = <K extends keyof IdentificationForm>(field: K, value: IdentificationForm[K]) => {
    setIdentification((current) => ({ ...current, [field]: value }));
    setIdentificationErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): string | null => {
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return "Nombres y apellidos deben tener al menos 2 caracteres.";
    }
    if (!programId) return "Selecciona el programa de la persona.";
    const numbers =
      validateInteger(semester, SEMESTER, { label: "El semestre", required: false }) ??
      validateInteger(weeklyHours, COLLABORATOR_WEEKLY_HOURS, { label: "Las horas por semana" });
    if (numbers) return numbers;
    if (props.mode === "create") {
      if (!EMAIL_PATTERN.test(email.trim())) return "Escribe un correo válido.";
      const errors = validateIdentification(identification, email);
      setIdentificationErrors(errors);
      if (hasErrors(errors)) return "Revisa los datos de identificación.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    setError(validationError ?? "");
    if (validationError) return;

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personType,
      programId,
      semester: optionalInteger(semester),
      researchGroup: optional(researchGroup),
      summary: optional(summary),
      availabilityStatus: availability,
      weeklyHours: Number(weeklyHours),
    };
    setIsSubmitting(true);
    try {
      if (props.mode === "create") {
        const created = await props.onCreate({
          ...profile,
          email: email.trim().toLowerCase(),
          dataConsent,
          ...toIdentificationPayload(identification),
        });
        props.onClose();
        void notify.success(`${created.firstName} ${created.lastName} quedó registrada como persona sin cuenta.`);
      } else {
        await props.onUpdate(profile);
        props.onClose();
        void notify.success(`El perfil de ${profile.firstName} ${profile.lastName} se actualizó.`);
      }
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar la persona. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      width="wide"
      title={props.mode === "create" ? "Registrar persona" : "Editar perfil de la persona"}
      onClose={props.onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() => void handleSubmit()}
    >
      {props.mode === "create" ? (
        <Input
          label="Correo institucional o personal"
          type="email"
          autoComplete="off"
          helperText="No se crea cuenta: la persona podrá registrarse después con este correo y su documento."
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      ) : null}
      <FormRow>
        <Input label="Nombres" maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        <Input label="Apellidos" maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} />
      </FormRow>
      <FormRow>
        <Select label="Tipo de persona" options={PERSON_TYPE_OPTIONS} value={personType} onValueChange={setPersonType} />
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
      </FormRow>
      {props.mode === "create" ? (
        <IdentificationFields value={identification} onChange={updateIdentification} errors={identificationErrors} />
      ) : null}
      <FormRow>
        <Input
          label="Semestre (opcional)"
          type="number"
          min={SEMESTER.min}
          max={SEMESTER.max}
          value={semester}
          onChange={(event) => setSemester(event.target.value)}
        />
        <Input
          label="Semillero o grupo (opcional)"
          maxLength={160}
          value={researchGroup}
          onChange={(event) => setResearchGroup(event.target.value)}
        />
      </FormRow>
      <FormRow>
        <Select label="Disponibilidad" options={AVAILABILITY_OPTIONS} value={availability} onValueChange={setAvailability} />
        <Input
          label="Horas por semana"
          type="number"
          min={COLLABORATOR_WEEKLY_HOURS.min}
          max={COLLABORATOR_WEEKLY_HOURS.max}
          value={weeklyHours}
          onChange={(event) => setWeeklyHours(event.target.value)}
        />
      </FormRow>
      <Textarea label="Resumen (opcional)" rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} />
      {props.mode === "create" ? (
        <LegalCheckbox
          label={`${DATA_CONSENT_LABEL} (la persona la otorgó por escrito)`}
          href={DATA_TREATMENT.href}
          checked={dataConsent}
          onChange={(event) => setDataConsent(event.target.checked)}
        />
      ) : null}
    </Modal>
  );
}
