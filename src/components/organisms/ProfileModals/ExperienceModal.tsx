"use client";

import { useState } from "react";
import type {
  Experience,
  ExperiencePayload,
  ExperienceTechnology,
  ExperienceType,
  SkillLevel,
} from "@/apis/interfaces/collaborator";
import {
  EXPERIENCE_WEEKLY_HOURS,
  validateExperienceDates,
  validateInteger,
} from "@/modules/collaborator/utils/collaborator-limits";
import { EXPERIENCE_TYPE_OPTIONS, LEVEL_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import { Checkbox, Input, Modal, Select, Textarea } from "../../atoms";
import { SkillPicker } from "../SkillPicker/SkillPicker";
import { clean, useProfileSubmit, type SubmitFn } from "./useProfileSubmit";

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
  const { isSubmitting, error, run, confirmDelete, failWith } = useProfileSubmit();

  const handleSubmit = () => {
    if (
      failWith(
        !clean(role) || !clean(organization) ? "El rol y la organización son obligatorios." : null,
        validateExperienceDates(startDate, endDate, current),
        validateInteger(weeklyHours, EXPERIENCE_WEEKLY_HOURS, { label: "La dedicación semanal" }),
      )
    ) {
      return;
    }
    void run(
      () =>
        onSubmit({
          type,
          role: clean(role),
          organization: clean(organization),
          startDate,
          endDate: current ? undefined : endDate,
          current,
          weeklyHours: Number(weeklyHours),
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
        onValueChange={setType}
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
      <Input label="Fecha de inicio" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      {!current ? (
        <Input
          label="Fecha de fin"
          type="date"
          min={startDate || undefined}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      ) : null}
      <Checkbox label="Actualmente activo" checked={current} onChange={(event) => setCurrent(event.target.checked)} />
      <Input
        label="Dedicación semanal (horas)"
        type="number"
        min={EXPERIENCE_WEEKLY_HOURS.min}
        max={EXPERIENCE_WEEKLY_HOURS.max}
        value={weeklyHours}
        onChange={(event) => setWeeklyHours(event.target.value)}
      />
      <Select
        label="Nivel"
        options={LEVEL_OPTIONS}
        value={level}
        onValueChange={setLevel}
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
