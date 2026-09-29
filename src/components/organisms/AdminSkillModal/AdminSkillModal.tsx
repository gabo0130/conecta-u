"use client";

import { useState } from "react";
import type { AdminCreateSkillPayload, Skill, SkillCategory, SkillStatus, SkillType, UpdateSkillPayload } from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Input, Modal, Select } from "../../atoms";
import { SKILL_CATEGORY_OPTIONS, SKILL_STATUS_OPTIONS, SKILL_TYPE_OPTIONS } from "../SkillPicker/skill-type";

type AdminSkillModalProps = {
  skill?: Skill;
  onCreate: (payload: AdminCreateSkillPayload) => Promise<unknown>;
  onUpdate: (payload: UpdateSkillPayload) => Promise<unknown>;
  onClose: () => void;
};

export function AdminSkillModal({ skill, onCreate, onUpdate, onClose }: AdminSkillModalProps) {
  const [name, setName] = useState(skill?.name ?? "");
  const [type, setType] = useState<SkillType>(skill?.type ?? "CONOCIMIENTO");
  const [category, setCategory] = useState<SkillCategory>(skill?.category ?? "OTRA");
  const [synonyms, setSynonyms] = useState((skill?.synonyms ?? []).join(", "));
  const [status, setStatus] = useState<SkillStatus>(skill?.status ?? "ACTIVA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const synonymsList = synonyms
      .split(",")
      .map((synonym) => synonym.trim())
      .filter(Boolean);
    setIsSubmitting(true);
    setError("");
    try {
      const payload = { name: trimmedName, type, category, synonyms: synonymsList, status };
      if (skill) {
        await onUpdate(payload);
      } else {
        await onCreate(payload);
      }
      onClose();
      void notify.success(skill ? "La habilidad se actualizó." : `"${trimmedName}" quedó creada en el catálogo.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar la habilidad. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={skill ? "Editar habilidad" : "Agregar habilidad"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() => void handleSubmit()}
    >
      <Input label="Nombre" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
      <Select label="Tipo" options={SKILL_TYPE_OPTIONS} value={type} onValueChange={setType} />
      <Select label="Categoría" options={SKILL_CATEGORY_OPTIONS} value={category} onValueChange={setCategory} />
      <Input
        label="Sinónimos (separados por coma, opcional)"
        value={synonyms}
        onChange={(event) => setSynonyms(event.target.value)}
      />
      <Select label="Estado" options={SKILL_STATUS_OPTIONS} value={status} onValueChange={setStatus} />
    </Modal>
  );
}
