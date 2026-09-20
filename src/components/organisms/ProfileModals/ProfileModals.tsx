"use client";

import { useState } from "react";
import type {
  AvailabilityPayload,
  AvailabilityStatus,
  ExperiencePayload,
  Profile,
  ProfileExperience,
  ProfileSkill,
  SkillPayload,
  SkillType,
  UpdateProfilePayload,
} from "@/apis/interfaces/profile";
import { getErrorMessage } from "@/utils/get-error-message";
import { Input, Modal, Select, Textarea } from "../../atoms";

type SubmitFn<T> = (payload: T) => Promise<unknown>;

function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<unknown>, onDone: () => void) => {
    setIsSubmitting(true);
    setError("");
    try {
      await action();
      onDone();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo guardar. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, setError, run };
}

const clean = (value: string) => value.trim();

type EditProfileModalProps = {
  profile: Profile;
  onSubmit: SubmitFn<UpdateProfilePayload>;
  onClose: () => void;
};

export function EditProfileModal({ profile, onSubmit, onClose }: EditProfileModalProps) {
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [studyGroup, setStudyGroup] = useState(profile.studyGroup ?? "");
  const { isSubmitting, error, run } = useSubmit();

  return (
    <Modal
      title="Editar perfil"
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() =>
        run(() => onSubmit({ headline: clean(headline), studyGroup: clean(studyGroup) }), onClose)
      }
    >
      <Input
        label="Titular"
        placeholder="Ej. Estudiante de Ingeniería de Sistemas"
        maxLength={160}
        value={headline}
        onChange={(event) => setHeadline(event.target.value)}
      />
      <Input
        label="Grupo o materia"
        placeholder="Ej. Grupo A · Programación Web"
        maxLength={120}
        value={studyGroup}
        onChange={(event) => setStudyGroup(event.target.value)}
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
  profile: Profile;
  onSubmit: SubmitFn<AvailabilityPayload>;
  onClose: () => void;
};

export function AvailabilityModal({ profile, onSubmit, onClose }: AvailabilityModalProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(profile.availabilityStatus);
  const [weeklyHours, setWeeklyHours] = useState(profile.weeklyHours ?? "");
  const [modality, setModality] = useState(profile.modality ?? "");
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
              weeklyHours: clean(weeklyHours),
              modality: clean(modality),
            }),
          onClose,
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
        label="Dedicación semanal"
        placeholder="Ej. 10–15 horas"
        maxLength={40}
        value={weeklyHours}
        onChange={(event) => setWeeklyHours(event.target.value)}
      />
      <Input
        label="Modalidad"
        placeholder="Ej. Presencial / Remoto"
        maxLength={60}
        value={modality}
        onChange={(event) => setModality(event.target.value)}
      />
    </Modal>
  );
}

const SKILL_TYPE_OPTIONS: { value: SkillType; label: string }[] = [
  { value: "CONOCIMIENTO", label: "Conocimiento" },
  { value: "COMPETENCIA", label: "Competencia" },
];

type SkillModalProps = {
  skill?: ProfileSkill;
  onSubmit: SubmitFn<SkillPayload>;
  onDelete?: () => Promise<unknown>;
  onClose: () => void;
};

export function SkillModal({ skill, onSubmit, onDelete, onClose }: SkillModalProps) {
  const [name, setName] = useState(skill?.name ?? "");
  const [type, setType] = useState<SkillType>(skill?.type ?? "CONOCIMIENTO");
  const [level, setLevel] = useState(skill?.level ?? "");
  const { isSubmitting, error, setError, run } = useSubmit();

  const handleSubmit = () => {
    if (!clean(name)) {
      setError("El nombre es obligatorio.");
      return;
    }
    void run(() => onSubmit({ name: clean(name), type, level: clean(level) || undefined }), onClose);
  };

  return (
    <Modal
      title={skill ? "Editar conocimiento o competencia" : "Agregar conocimiento o competencia"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
      dangerAction={onDelete ? { label: "Eliminar", onClick: () => void run(onDelete, onClose) } : undefined}
    >
      <Input
        label="Nombre"
        placeholder="Ej. React"
        maxLength={80}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Select
        label="Tipo"
        options={SKILL_TYPE_OPTIONS}
        value={type}
        onChange={(event) => setType(event.target.value as SkillType)}
      />
      <Input
        label="Nivel (opcional)"
        placeholder="Ej. Intermedio"
        maxLength={20}
        value={level}
        onChange={(event) => setLevel(event.target.value)}
      />
    </Modal>
  );
}

type ExperienceModalProps = {
  experience?: ProfileExperience;
  onSubmit: SubmitFn<ExperiencePayload>;
  onClose: () => void;
};

export function ExperienceModal({ experience, onSubmit, onClose }: ExperienceModalProps) {
  const [title, setTitle] = useState(experience?.title ?? "");
  const [organization, setOrganization] = useState(experience?.organization ?? "");
  const [period, setPeriod] = useState(experience?.period ?? "");
  const [description, setDescription] = useState(experience?.description ?? "");
  const { isSubmitting, error, setError, run } = useSubmit();

  const handleSubmit = () => {
    if (!clean(title)) {
      setError("El título es obligatorio.");
      return;
    }
    void run(
      () =>
        onSubmit({
          title: clean(title),
          organization: clean(organization),
          period: clean(period),
          description: clean(description),
        }),
      onClose,
    );
  };

  return (
    <Modal
      title={experience ? "Editar experiencia" : "Agregar experiencia"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
    >
      <Input
        label="Título"
        placeholder="Ej. Desarrollador Frontend"
        maxLength={140}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Input
        label="Organización"
        placeholder="Ej. Semillero de Software"
        maxLength={140}
        value={organization}
        onChange={(event) => setOrganization(event.target.value)}
      />
      <Input
        label="Periodo"
        placeholder="Ej. 2024 – actual"
        maxLength={60}
        value={period}
        onChange={(event) => setPeriod(event.target.value)}
      />
      <Textarea
        label="Descripción"
        rows={3}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
    </Modal>
  );
}
