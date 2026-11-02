"use client";

import { useState } from "react";
import type { Need, NeedKind, NeedPayload } from "@/apis/interfaces/needs";
import {
  NEED_KIND_OPTIONS,
  NEED_LIMITS,
  NEED_SCALE_OPTIONS,
  toNeedScale,
  type NeedScale,
  validateNeed,
} from "@/modules/needs/utils/need-view";
import { Button, Card, FormError, FormRow, Input, Select, Textarea } from "../../atoms";
import styles from "./NeedForm.module.css";

type NeedFormProps = {
  initial?: Need;
  submitLabel: string;
  isSaving: boolean;
  onSubmit: (payload: NeedPayload) => void;
  onCancel: () => void;
};

/** Registrar o editar una necesidad institucional (tesis, D1) en lenguaje natural. */
export function NeedForm({ initial, submitLabel, isSaving, onSubmit, onCancel }: NeedFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [kind, setKind] = useState<NeedKind>(initial?.kind ?? "ACADEMICA");
  const [urgency, setUrgency] = useState<NeedScale>(toNeedScale(initial?.urgency));
  const [impact, setImpact] = useState<NeedScale>(toNeedScale(initial?.impact));
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [dependency, setDependency] = useState(initial?.dependency ?? "");
  const [validation, setValidation] = useState("");

  const handleSubmit = () => {
    const problem = validateNeed({ title, description });
    if (problem) {
      setValidation(problem);
      return;
    }
    setValidation("");
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      kind,
      urgency: Number(urgency),
      impact: Number(impact),
      // Vacío borra el valor guardado al editar; al registrar, simplemente no se envía.
      deadline: deadline || (initial ? null : undefined),
      dependency: dependency.trim() || (initial ? null : undefined),
    });
  };

  return (
    <div className={styles.root}>
      <Card padding={24} className={styles.formCard}>
        <Input
          label="Título"
          placeholder="Ej. Plataforma de citas para Bienestar"
          maxLength={NEED_LIMITS.title.max}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Textarea
          label="Describe la necesidad"
          rows={6}
          maxLength={NEED_LIMITS.description.max}
          placeholder="¿Qué pasa hoy, a quién afecta y qué se espera lograr? Escríbelo con tus palabras."
          helperText="La IA la caracteriza a partir de este texto: entre más concreta, mejor."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <FormRow>
          <Select label="Tipo de necesidad" options={NEED_KIND_OPTIONS} value={kind} onValueChange={setKind} />
          <Input
            label="Dependencia que la plantea (opcional)"
            placeholder="Ej. Bienestar Universitario"
            maxLength={NEED_LIMITS.dependencyMax}
            value={dependency}
            onChange={(event) => setDependency(event.target.value)}
          />
        </FormRow>
        <FormRow>
          <Select
            label="Urgencia"
            options={NEED_SCALE_OPTIONS}
            value={urgency}
            onValueChange={setUrgency}
            helperText="Qué tan pronto hay que atenderla."
          />
          <Select
            label="Impacto"
            options={NEED_SCALE_OPTIONS}
            value={impact}
            onValueChange={setImpact}
            helperText="A cuántas personas o procesos beneficia."
          />
        </FormRow>
        <Input
          label="Plazo esperado (opcional)"
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
        />
        {validation ? <FormError>{validation}</FormError> : null}
      </Card>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
