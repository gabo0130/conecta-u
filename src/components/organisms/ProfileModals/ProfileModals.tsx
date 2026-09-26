"use client";

import { useState } from "react";
import type {
  AvailabilityPayload,
  AvailabilityStatus,
  Collaborator,
  CollaboratorSkill,
  CollaboratorSkillPayload,
  CreateCollaboratorPayload,
  Experience,
  ExperiencePayload,
  ExperienceTechnology,
  ExperienceType,
  SkillLevel,
  UpdateCollaboratorPayload,
} from "@/apis/interfaces/collaborator";
import type { PersonType } from "@/apis/interfaces/auth";
import type { Skill } from "@/apis/interfaces/catalogs";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Checkbox, Input, Modal, Select, Textarea } from "../../atoms";
import { SkillPicker } from "../SkillPicker/SkillPicker";

type SubmitFn<T> = (payload: T) => Promise<unknown>;

function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Las validaciones del formulario se muestran en línea (`error`); el resultado de la acción
  // (éxito o error del backend) se notifica en un modal.
  const run = async (action: () => Promise<unknown>, onDone: () => void, successMessage: string) => {
    setIsSubmitting(true);
    setError("");
    try {
      await action();
      onDone();
      void notify.success(successMessage);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (message: string, action: () => Promise<unknown>, onDone: () => void, successMessage: string) => {
    if (await notify.confirm({ message, tone: "danger" })) await run(action, onDone, successMessage);
  };

  return { isSubmitting, error, setError, run, confirmDelete };
}

const clean = (value: string) => value.trim();

const PERSON_TYPE_OPTIONS: { value: PersonType; label: string }[] = [
  { value: "ESTUDIANTE", label: "Estudiante" },
  { value: "DOCENTE", label: "Docente" },
];

type CreateProfileModalProps = {
  onSubmit: SubmitFn<CreateCollaboratorPayload>;
  onClose: () => void;
};

export function CreateProfileModal({ onSubmit, onClose }: CreateProfileModalProps) {
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personType, setPersonType] = useState<PersonType>("DOCENTE");
  const [programId, setProgramId] = useState("");
  const { isSubmitting, error, setError, run } = useSubmit();

  const handleSubmit = () => {
    if (!clean(firstName) || !clean(lastName)) {
      setError("Nombres y apellidos son obligatorios.");
      return;
    }
    if (!programId) {
      setError("Selecciona un programa.");
      return;
    }
    void run(
      () =>
        onSubmit({
          firstName: clean(firstName),
          lastName: clean(lastName),
          personType,
          programId,
        }),
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
        onChange={(event) => setPersonType(event.target.value as PersonType)}
      />
      <Select
        label="Programa"
        options={[
          { value: "", label: isLoadingPrograms ? "Cargando programas..." : "Selecciona un programa" },
          ...programs.map((program) => ({ value: program.id, label: program.name })),
        ]}
        value={programId}
        onChange={(event) => setProgramId(event.target.value)}
        disabled={isLoadingPrograms}
      />
    </Modal>
  );
}

type EditProfileModalProps = {
  collaborator: Collaborator;
  onSubmit: SubmitFn<UpdateCollaboratorPayload>;
  onClose: () => void;
};

export function EditProfileModal({ collaborator, onSubmit, onClose }: EditProfileModalProps) {
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();
  const [firstName, setFirstName] = useState(collaborator.firstName);
  const [lastName, setLastName] = useState(collaborator.lastName);
  const [programId, setProgramId] = useState(collaborator.programId);
  const [semester, setSemester] = useState(collaborator.semester?.toString() ?? "");
  const [researchGroup, setResearchGroup] = useState(collaborator.researchGroup ?? "");
  const [summary, setSummary] = useState(collaborator.summary ?? "");
  const [profileUrl, setProfileUrl] = useState(collaborator.profileUrl ?? "");
  const { isSubmitting, error, run } = useSubmit();

  return (
    <Modal
      title="Editar perfil"
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() =>
        run(
          () =>
            onSubmit({
              firstName: clean(firstName),
              lastName: clean(lastName),
              programId,
              semester: semester ? Number(semester) : undefined,
              researchGroup: clean(researchGroup),
              summary: clean(summary),
              profileUrl: clean(profileUrl),
            }),
          onClose,
          "Tus datos se actualizaron.",
        )
      }
    >
      <Input
        label="Nombres"
        maxLength={80}
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
      />
      <Input
        label="Apellidos"
        maxLength={80}
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
      />
      <Select
        label="Programa"
        options={
          isLoadingPrograms
            ? [{ value: programId, label: "Cargando programas..." }]
            : programs.map((program) => ({ value: program.id, label: program.name }))
        }
        value={programId}
        onChange={(event) => setProgramId(event.target.value)}
        disabled={isLoadingPrograms}
      />
      <Input
        label="Semestre (opcional)"
        type="number"
        min={1}
        max={12}
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
      <Textarea
        label="Resumen (opcional)"
        rows={3}
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
      />
      <Input
        label="Enlace de portafolio (opcional)"
        placeholder="https://..."
        value={profileUrl}
        onChange={(event) => setProfileUrl(event.target.value)}
      />
    </Modal>
  );
}

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "PARCIAL", label: "Parcial" },
  { value: "NO_DISPONIBLE", label: "No disponible" },
];

type AvailabilityModalProps = {
  collaborator: Collaborator;
  onSubmit: SubmitFn<AvailabilityPayload>;
  onClose: () => void;
};

export function AvailabilityModal({ collaborator, onSubmit, onClose }: AvailabilityModalProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(collaborator.availabilityStatus);
  const [weeklyHours, setWeeklyHours] = useState(collaborator.weeklyHours.toString());
  const { isSubmitting, error, run } = useSubmit();

  return (
    <Modal
      title="Editar disponibilidad"
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() =>
        run(
          () =>
            onSubmit({
              availabilityStatus: status,
              weeklyHours: Number(weeklyHours) || 0,
            }),
          onClose,
          "Tu disponibilidad se actualizó.",
        )
      }
    >
      <Select
        label="Estado"
        options={AVAILABILITY_OPTIONS}
        value={status}
        onChange={(event) => setStatus(event.target.value as AvailabilityStatus)}
      />
      <Input
        label="Dedicación semanal (horas)"
        type="number"
        min={0}
        max={60}
        value={weeklyHours}
        onChange={(event) => setWeeklyHours(event.target.value)}
      />
    </Modal>
  );
}

const LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: "BASICO", label: "Básico" },
  { value: "INTERMEDIO", label: "Intermedio" },
  { value: "AVANZADO", label: "Avanzado" },
  { value: "EXPERTO", label: "Experto" },
];

type SkillModalProps = {
  skill?: CollaboratorSkill;
  onSubmit: SubmitFn<CollaboratorSkillPayload>;
  onDelete?: () => Promise<unknown>;
  onClose: () => void;
};

export function SkillModal({ skill, onSubmit, onDelete, onClose }: SkillModalProps) {
  const [selected, setSelected] = useState<Skill[]>(skill ? [skill.skill] : []);
  const [level, setLevel] = useState<SkillLevel>(skill?.level ?? "BASICO");
  const [experienceMonths, setExperienceMonths] = useState(skill?.experienceMonths.toString() ?? "0");
  const [lastUsedYear, setLastUsedYear] = useState(skill?.lastUsedYear?.toString() ?? "");
  const { isSubmitting, error, setError, run, confirmDelete } = useSubmit();

  const handleSubmit = () => {
    if (selected.length === 0) {
      setError("Selecciona una habilidad.");
      return;
    }
    void run(
      () =>
        onSubmit({
          skillId: selected[0].id,
          level,
          experienceMonths: Number(experienceMonths) || 0,
          lastUsedYear: lastUsedYear ? Number(lastUsedYear) : undefined,
        }),
      onClose,
      skill ? "La habilidad se actualizó." : "La habilidad se agregó a tu perfil.",
    );
  };

  return (
    <Modal
      title={skill ? "Editar conocimiento o competencia" : "Agregar conocimiento o competencia"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
      dangerAction={
        onDelete
          ? {
              label: "Eliminar",
              onClick: () =>
                void confirmDelete(
                  "La habilidad se quitará de tu perfil. Esta acción no se puede deshacer.",
                  onDelete,
                  onClose,
                  "La habilidad se eliminó de tu perfil.",
                ),
            }
          : undefined
      }
    >
      <SkillPicker label="Habilidad" mode="single" value={selected} onChange={setSelected} />
      <Select
        label="Nivel"
        options={LEVEL_OPTIONS}
        value={level}
        onChange={(event) => setLevel(event.target.value as SkillLevel)}
      />
      <Input
        label="Meses de experiencia"
        type="number"
        min={0}
        max={600}
        value={experienceMonths}
        onChange={(event) => setExperienceMonths(event.target.value)}
      />
      <Input
        label="Último año de uso (opcional)"
        type="number"
        value={lastUsedYear}
        onChange={(event) => setLastUsedYear(event.target.value)}
      />
    </Modal>
  );
}

const EXPERIENCE_TYPE_OPTIONS: { value: ExperienceType; label: string }[] = [
  { value: "LABORAL", label: "Laboral" },
  { value: "PRACTICA", label: "Práctica" },
  { value: "PROYECTO_ACADEMICO", label: "Proyecto académico" },
  { value: "SEMILLERO_INVESTIGACION", label: "Semillero de investigación" },
  { value: "PROYECTO_PERSONAL", label: "Proyecto personal" },
  { value: "VOLUNTARIADO", label: "Voluntariado" },
  { value: "DOCENCIA", label: "Docencia" },
];

type ExperienceModalProps = {
  experience?: Experience;
  onSubmit: SubmitFn<ExperiencePayload>;
  onDelete?: () => Promise<unknown>;
  onClose: () => void;
};

export function ExperienceModal({ experience, onSubmit, onDelete, onClose }: ExperienceModalProps) {
  const [type, setType] = useState<ExperienceType>(experience?.type ?? "LABORAL");
  const [role, setRole] = useState(experience?.role ?? "");
  const [organization, setOrganization] = useState(experience?.organization ?? "");
  const [startDate, setStartDate] = useState(experience?.startDate.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(experience?.endDate?.slice(0, 10) ?? "");
  const [current, setCurrent] = useState(experience?.current ?? false);
  const [weeklyHours, setWeeklyHours] = useState(experience?.weeklyHours.toString() ?? "10");
  const [level, setLevel] = useState<SkillLevel>(experience?.level ?? "BASICO");
  const [description, setDescription] = useState(experience?.description ?? "");
  const [technologies, setTechnologies] = useState<ExperienceTechnology[]>(experience?.technologies ?? []);
  const { isSubmitting, error, setError, run, confirmDelete } = useSubmit();

  const handleSubmit = () => {
    if (!clean(role) || !clean(organization) || !startDate) {
      setError("Rol, organización y fecha de inicio son obligatorios.");
      return;
    }
    void run(
      () =>
        onSubmit({
          type,
          role: clean(role),
          organization: clean(organization),
          startDate,
          endDate: current ? undefined : endDate || undefined,
          current,
          weeklyHours: Number(weeklyHours) || 0,
          level,
          skillIds: technologies.map((skill) => skill.id),
          description: clean(description) || undefined,
        }),
      onClose,
      experience ? "La experiencia se actualizó." : "La experiencia se agregó a tu perfil.",
    );
  };

  return (
    <Modal
      title={experience ? "Editar experiencia" : "Agregar experiencia"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
      dangerAction={
        onDelete
          ? {
              label: "Eliminar",
              onClick: () =>
                void confirmDelete(
                  "La experiencia se quitará de tu perfil. Esta acción no se puede deshacer.",
                  onDelete,
                  onClose,
                  "La experiencia se eliminó de tu perfil.",
                ),
            }
          : undefined
      }
    >
      <Select
        label="Tipo"
        options={EXPERIENCE_TYPE_OPTIONS}
        value={type}
        onChange={(event) => setType(event.target.value as ExperienceType)}
      />
      <Input
        label="Rol"
        placeholder="Ej. Desarrollador Frontend"
        maxLength={120}
        value={role}
        onChange={(event) => setRole(event.target.value)}
      />
      <Input
        label="Organización"
        placeholder="Ej. Semillero de Software"
        maxLength={160}
        value={organization}
        onChange={(event) => setOrganization(event.target.value)}
      />
      <Input
        label="Fecha de inicio"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
      />
      {!current ? (
        <Input
          label="Fecha de fin"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      ) : null}
      <Checkbox
        label="Actualmente activo"
        checked={current}
        onChange={(event) => setCurrent(event.target.checked)}
      />
      <Input
        label="Dedicación semanal (horas)"
        type="number"
        min={1}
        max={60}
        value={weeklyHours}
        onChange={(event) => setWeeklyHours(event.target.value)}
      />
      <Select
        label="Nivel"
        options={LEVEL_OPTIONS}
        value={level}
        onChange={(event) => setLevel(event.target.value as SkillLevel)}
      />
      <SkillPicker label="Tecnologías (opcional)" mode="multi" value={technologies} onChange={setTechnologies} />
      <Textarea
        label="Descripción (opcional)"
        rows={3}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
    </Modal>
  );
}
