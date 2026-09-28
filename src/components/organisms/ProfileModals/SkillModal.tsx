"use client";

import { useState } from "react";
import type { Skill } from "@/apis/interfaces/catalogs";
import type { CollaboratorSkill, CollaboratorSkillPayload, SkillLevel } from "@/apis/interfaces/collaborator";
import {
  MIN_LAST_USED_YEAR,
  optionalInteger,
  SKILL_EXPERIENCE_MONTHS,
  validateInteger,
} from "@/modules/collaborator/utils/collaborator-limits";
import { LEVEL_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import { Input, Modal, Select } from "../../atoms";
import { SkillPicker } from "../SkillPicker/SkillPicker";
import { useProfileSubmit, type SubmitFn } from "./useProfileSubmit";

type SkillModalProps = {
  skill?: CollaboratorSkill;
  onSubmit: SubmitFn<CollaboratorSkillPayload>;
  onDelete?: () => Promise<unknown>;
  onClose: () => void;
};

export function SkillModal({ skill, onSubmit, onDelete, onClose }: SkillModalProps) {
  const [selected, setSelected] = useState<Skill[]>(skill ? [skill.skill] : []);
  const [level, setLevel] = useState<SkillLevel>(skill?.level ?? "BASICO");
  const [experienceMonths, setExperienceMonths] = useState(skill?.experienceMonths.toString() ?? "");
  const [lastUsedYear, setLastUsedYear] = useState(skill?.lastUsedYear?.toString() ?? "");
  const { isSubmitting, error, run, confirmDelete, failWith } = useProfileSubmit();
  const currentYear = new Date().getFullYear();

  const handleSubmit = () => {
    if (
      failWith(
        selected.length === 0 ? "Selecciona una habilidad." : null,
        validateInteger(experienceMonths, SKILL_EXPERIENCE_MONTHS, { label: "Los meses de experiencia" }),
        validateInteger(lastUsedYear, { min: MIN_LAST_USED_YEAR, max: currentYear }, {
          label: "El último año de uso",
          required: false,
        }),
      )
    ) {
      return;
    }
    void run(
      () =>
        onSubmit({
          skillId: selected[0].id,
          level,
          experienceMonths: Number(experienceMonths),
          lastUsedYear: optionalInteger(lastUsedYear) ?? undefined,
        }),
      onClose,
      skill ? "La habilidad se actualizó." : "La habilidad se agregó a tu perfil.",
    );
  };

  return (
    <Modal
      title={skill ? "Editar habilidad" : "Agregar habilidad"}
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
        onValueChange={setLevel}
      />
      <Input
        label="Meses de experiencia"
        type="number"
        min={SKILL_EXPERIENCE_MONTHS.min}
        max={SKILL_EXPERIENCE_MONTHS.max}
        value={experienceMonths}
        onChange={(event) => setExperienceMonths(event.target.value)}
      />
      <Input
        label="Último año de uso (opcional)"
        type="number"
        min={MIN_LAST_USED_YEAR}
        max={currentYear}
        value={lastUsedYear}
        onChange={(event) => setLastUsedYear(event.target.value)}
      />
    </Modal>
  );
}
