"use client";

import { KeyboardEvent, useState } from "react";
import type { Project, ProjectPayload } from "@/apis/interfaces/projects";
import { Button, Card, Chip, Input, Select, Textarea } from "../../atoms";
import styles from "./ProjectForm.module.css";

const SEMILLERO_OPTIONS = ["Semillero de Software", "Semillero de Datos", "Semillero de Investigación"];
const PROGRAMA_OPTIONS = ["Ing. de Sistemas", "Ing. Electrónica", "Ing. Industrial"];

function toOptions(base: string[], current?: string | null) {
  const values = current && !base.includes(current) ? [...base, current] : base;
  return values.map((value) => ({ value, label: value }));
}

type ProjectFormProps = {
  initial?: Project;
  submitLabel: string;
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: ProjectPayload) => void;
  onCancel: () => void;
};

export function ProjectForm({ initial, submitLabel, isSaving, error, onSubmit, onCancel }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [objectives, setObjectives] = useState(initial?.objectives ?? "");
  const [skills, setSkills] = useState<string[]>(initial?.knownSkills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [semillero, setSemillero] = useState(initial?.semillero ?? SEMILLERO_OPTIONS[0]);
  const [programa, setPrograma] = useState(initial?.program ?? PROGRAMA_OPTIONS[0]);
  const [validation, setValidation] = useState("");

  const addSkill = () => {
    const trimmed = skillDraft.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillDraft("");
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setValidation("El título debe tener al menos 3 caracteres.");
      return;
    }
    if (!summary.trim() || !objectives.trim()) {
      setValidation("El resumen y los objetivos son obligatorios.");
      return;
    }
    setValidation("");

    const pending = skillDraft.trim();
    const knownSkills = pending && !skills.includes(pending) ? [...skills, pending] : skills;

    onSubmit({
      title: trimmedTitle,
      summary: summary.trim(),
      objectives: objectives.trim(),
      knownSkills,
      semillero,
      program: programa,
    });
  };

  const message = validation || error;

  return (
    <>
      <Card padding={24} className={styles.formCard}>
        <Input
          label="Título del proyecto"
          placeholder="Nombre del proyecto"
          maxLength={160}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Textarea
          label="Resumen"
          rows={3}
          placeholder="Describe brevemente el proyecto"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />

        <Textarea
          label="Objetivos"
          rows={3}
          placeholder="¿Qué busca lograr el proyecto?"
          value={objectives}
          onChange={(event) => setObjectives(event.target.value)}
        />

        <div className={styles.field}>
          <label className={styles.label}>Habilidades técnicas conocidas</label>
          <div className={styles.chipsInput}>
            {skills.map((skill) => (
              <Chip key={skill} tone="red">
                {skill}
                <button
                  type="button"
                  className={styles.removeSkill}
                  onClick={() => setSkills(skills.filter((item) => item !== skill))}
                  aria-label={`Quitar ${skill}`}
                >
                  ×
                </button>
              </Chip>
            ))}
            <input
              className={styles.skillInput}
              value={skillDraft}
              onChange={(event) => setSkillDraft(event.target.value)}
              onKeyDown={handleSkillKeyDown}
              onBlur={addSkill}
              placeholder="Escribe y presiona Enter…"
            />
          </div>
        </div>

        <div className={styles.row}>
          <Select
            label="Semillero"
            options={toOptions(SEMILLERO_OPTIONS, initial?.semillero)}
            value={semillero}
            onChange={(event) => setSemillero(event.target.value)}
          />
          <Select
            label="Programa"
            options={toOptions(PROGRAMA_OPTIONS, initial?.program)}
            value={programa}
            onChange={(event) => setPrograma(event.target.value)}
          />
        </div>

        {message ? <div className={styles.error}>{message}</div> : null}
      </Card>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </>
  );
}
