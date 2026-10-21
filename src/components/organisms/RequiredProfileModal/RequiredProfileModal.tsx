"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type {
  CreateRequiredProfilePayload,
  RequiredProfile,
  UpdateRequiredProfilePayload,
} from "@/apis/interfaces/analysis";
import type { SkillType } from "@/apis/interfaces/catalogs";
import {
  IMPORTANCE_OPTIONS,
  PRIORITY_OPTIONS,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_QUANTITY,
  PROFILE_SKILLS,
  PROFILE_TEXT_MAX_LENGTH,
  PROFILE_WEEKLY_HOURS,
  ProfileTimeoutError,
  toCreatePayload,
  toProfileForm,
  toUpdatePayload,
  validateProfileForm,
  type ProfileSkillRow,
  type RequiredProfileForm,
} from "@/modules/analysis/utils/analysis-view";
import { LEVEL_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { FormRow, IconButton, Input, Modal, Select, Textarea } from "../../atoms";
import { SkillPicker } from "../SkillPicker/SkillPicker";
import { SKILL_TYPE_LABEL } from "../SkillPicker/skill-type";
import styles from "./RequiredProfileModal.module.css";

type PickedSkill = { id: string; name: string; type: SkillType };

type RequiredProfileModalProps = {
  /** Sin perfil, crea uno manual; con perfil, lo edita (también los de la IA). */
  profile?: RequiredProfile;
  onCreate: (payload: CreateRequiredProfilePayload) => Promise<unknown>;
  onUpdate: (payload: UpdateRequiredProfilePayload) => Promise<unknown>;
  onClose: () => void;
};

export function RequiredProfileModal({ profile, onCreate, onUpdate, onClose }: RequiredProfileModalProps) {
  // Valores al abrir: el PATCH solo lleva lo que cambió respecto de ellos.
  const [initialForm] = useState<RequiredProfileForm>(() => toProfileForm(profile));
  const [form, setForm] = useState<RequiredProfileForm>(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = <K extends keyof RequiredProfileForm>(key: K, value: RequiredProfileForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setSkills = (skills: ProfileSkillRow[]) => setForm((current) => ({ ...current, skills, skillsChanged: true }));
  const updateSkill = (index: number, changes: Partial<ProfileSkillRow>) =>
    setSkills(form.skills.map((skill, i) => (i === index ? { ...skill, ...changes } : skill)));

  const catalogued = form.skills.filter((skill) => skill.skillId);
  const uncatalogued = form.skills.filter((skill) => !skill.skillId);
  const isFull = catalogued.length >= PROFILE_SKILLS.max;
  const picked: PickedSkill[] = catalogued.map((skill) => ({ id: skill.skillId ?? "", name: skill.name, type: skill.type }));

  // El picker devuelve la lista completa; las habilidades nuevas son las que aún no están en el formulario.
  const handlePick = (next: PickedSkill[]) => {
    const known = new Set(picked.map((skill) => skill.id));
    const added = next.filter((skill) => !known.has(skill.id));
    if (added.length === 0) return;
    setSkills([
      ...form.skills,
      ...added.map((skill) => ({
        skillId: skill.id,
        name: skill.name,
        type: skill.type,
        minLevel: "INTERMEDIO" as const,
        importance: "MEDIA" as const,
      })),
    ]);
  };

  const handleSubmit = async () => {
    const validation = validateProfileForm(profile ? form : { ...form, skillsChanged: true });
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    const changes = profile ? toUpdatePayload(form, initialForm) : null;
    if (changes && Object.keys(changes).length === 0) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    try {
      if (changes) {
        await onUpdate(changes);
      } else {
        await onCreate(toCreatePayload(form));
      }
      onClose();
      void notify.success(profile ? `El perfil "${form.name.trim()}" se actualizó.` : `El perfil "${form.name.trim()}" se agregó.`);
    } catch (err) {
      // Cortado por tiempo: la lista ya se refrescó; se cierra para no volver a enviarlo y duplicarlo.
      if (err instanceof ProfileTimeoutError) {
        onClose();
        void notify.warning(err.message);
        return;
      }
      void notify.error(getErrorMessage(err, "No se pudo guardar el perfil. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={profile ? "Editar perfil requerido" : "Agregar perfil requerido"}
      width="wide"
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      submitLabel={profile ? "Guardar cambios" : "Agregar perfil"}
      isSubmitting={isSubmitting}
      error={error}
    >
      <Input
        label="Nombre del perfil"
        placeholder="Ej. Diseñador de interfaces"
        maxLength={PROFILE_NAME_MAX_LENGTH}
        value={form.name}
        onChange={(event) => set("name", event.target.value)}
      />
      <Textarea
        label="Descripción (opcional)"
        rows={2}
        maxLength={PROFILE_TEXT_MAX_LENGTH}
        value={form.description}
        onChange={(event) => set("description", event.target.value)}
      />
      <Textarea
        label="Justificación (opcional)"
        helperText="Por qué el proyecto necesita este perfil."
        rows={3}
        maxLength={PROFILE_TEXT_MAX_LENGTH}
        value={form.justification}
        onChange={(event) => set("justification", event.target.value)}
      />
      <FormRow columns={3}>
        <Input
          label="Personas"
          type="number"
          min={PROFILE_QUANTITY.min}
          max={PROFILE_QUANTITY.max}
          value={form.quantity}
          onChange={(event) => set("quantity", event.target.value)}
        />
        <Select label="Prioridad" options={PRIORITY_OPTIONS} value={form.priority} onValueChange={(value) => set("priority", value)} />
        <Input
          label="Horas/semana (opcional)"
          type="number"
          min={PROFILE_WEEKLY_HOURS.min}
          max={PROFILE_WEEKLY_HOURS.max}
          value={form.minWeeklyHours}
          onChange={(event) => set("minWeeklyHours", event.target.value)}
        />
      </FormRow>

      <div className={styles.skillsBlock}>
        <SkillPicker<PickedSkill>
          label={`Habilidades (${catalogued.length}/${PROFILE_SKILLS.max})`}
          mode="multi"
          catalogOnly
          hideSelected
          disabled={isFull}
          value={picked}
          onChange={(next) => handlePick(next.map((skill) => ({ id: skill.id, name: skill.name, type: skill.type })))}
        />
        {isFull ? <p className={styles.hint}>Llegaste al máximo de {PROFILE_SKILLS.max} habilidades.</p> : null}
        {form.skills.length === 0 ? (
          <p className={styles.hint}>Busca y agrega entre 1 y {PROFILE_SKILLS.max} habilidades del catálogo.</p>
        ) : (
          <ul className={styles.skillList} aria-label="Habilidades del perfil">
            {form.skills.map((skill, index) => (
              <li key={skill.skillId ?? `sin-catalogo-${skill.name}`} className={styles.skillRow}>
                <div className={styles.skillInfo}>
                  <span className={styles.skillName}>{skill.name}</span>
                  <span className={styles.skillType}>
                    {skill.skillId ? SKILL_TYPE_LABEL[skill.type] : "No catalogada"}
                  </span>
                </div>
                {skill.skillId ? (
                  <>
                    <Select
                      aria-label={`Nivel mínimo de ${skill.name}`}
                      className={styles.level}
                      size="sm"
                      options={LEVEL_OPTIONS}
                      value={skill.minLevel}
                      onValueChange={(minLevel) => updateSkill(index, { minLevel })}
                    />
                    <Select
                      aria-label={`Importancia de ${skill.name}`}
                      className={styles.importance}
                      size="sm"
                      options={IMPORTANCE_OPTIONS}
                      value={skill.importance}
                      onValueChange={(importance) => updateSkill(index, { importance })}
                    />
                  </>
                ) : null}
                <IconButton
                  className={styles.remove}
                  size="sm"
                  variant="plain"
                  tone="danger"
                  label={`Quitar ${skill.name}`}
                  icon={<X />}
                  onClick={() => setSkills(form.skills.filter((_, i) => i !== index))}
                />
              </li>
            ))}
          </ul>
        )}
        {uncatalogued.length > 0 ? (
          <p className={styles.notice} role="note">
            {form.skillsChanged
              ? "Las habilidades no catalogadas no se guardarán: al cambiar la lista solo se conservan las del catálogo."
              : "Las habilidades no catalogadas que propuso la IA se conservan mientras no cambies la lista de habilidades."}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
