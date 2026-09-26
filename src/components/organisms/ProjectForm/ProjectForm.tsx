"use client";

import { useState } from "react";
import type { Skill } from "@/apis/interfaces/catalogs";
import type { Deliverable, Project, ProjectPayload } from "@/apis/interfaces/projects";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { DeliverablesEditor } from "../../molecules/DeliverablesEditor/DeliverablesEditor";
import { Button, Card, FormError, FormRow, Input, Select, Textarea } from "../../atoms";
import type { ControlSize } from "../../atoms";
import { DynamicTypeFields } from "../DynamicTypeFields/DynamicTypeFields";
import { SkillPicker } from "../SkillPicker/SkillPicker";
import styles from "./ProjectForm.module.css";

const EMPTY_DELIVERABLES: Deliverable[] = [{ name: "", scope: "" }];

type ProjectFormProps = {
  initial?: Project;
  submitLabel: string;
  isSaving: boolean;
  onSubmit: (payload: ProjectPayload) => void;
  onCancel: () => void;
  /** Tamaño de todos los campos y botones del formulario. */
  size?: ControlSize;
};

export function ProjectForm({ initial, submitLabel, isSaving, onSubmit, onCancel, size }: ProjectFormProps) {
  const { projectTypes, isLoading: isLoadingTypes } = useProjectTypesCatalog();
  const { projectCategories, isLoading: isLoadingCategories } = useProjectCategoriesCatalog();
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [objectives, setObjectives] = useState(initial?.objectives ?? "");
  const [typeId, setTypeId] = useState(initial?.typeId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [programId, setProgramId] = useState(initial?.programId ?? "");
  const [typeData, setTypeData] = useState<Record<string, unknown>>(initial?.typeData ?? {});
  const [knownSkills, setKnownSkills] = useState<Skill[]>(initial?.knownSkills ?? []);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    initial?.deliverables && initial.deliverables.length > 0 ? initial.deliverables : EMPTY_DELIVERABLES,
  );
  const [validation, setValidation] = useState("");

  // En creación, antes de que el usuario elija, se preselecciona el primer tipo/categoría del catálogo.
  const effectiveTypeId = typeId || (!initial ? (projectTypes[0]?.id ?? "") : "");
  const effectiveCategoryId = categoryId || (!initial ? (projectCategories[0]?.id ?? "") : "");

  const selectedType = projectTypes.find((type) => type.id === effectiveTypeId);

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
    if (!effectiveTypeId || !effectiveCategoryId) {
      setValidation("Selecciona el tipo y la categoría del proyecto.");
      return;
    }
    const cleanDeliverables = deliverables
      .map((deliverable) => ({ name: deliverable.name.trim(), scope: deliverable.scope.trim() }))
      .filter((deliverable) => deliverable.name && deliverable.scope);
    if (cleanDeliverables.length === 0) {
      setValidation("Agrega al menos un entregable con nombre y alcance.");
      return;
    }
    setValidation("");

    onSubmit({
      title: trimmedTitle,
      summary: summary.trim(),
      objectives: objectives.trim(),
      typeId: effectiveTypeId,
      categoryId: effectiveCategoryId,
      programId: programId || undefined,
      typeData,
      knownSkillIds: knownSkills.map((skill) => skill.id),
      deliverables: cleanDeliverables,
    });
  };


  return (
    <div data-size={size} className={styles.root}>
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

        <FormRow>
          <Select
            label="Tipo de proyecto"
            options={
              isLoadingTypes
                ? [{ value: "", label: "Cargando..." }]
                : projectTypes.map((type) => ({ value: type.id, label: type.name }))
            }
            value={effectiveTypeId}
            onChange={(event) => setTypeId(event.target.value)}
            disabled={isLoadingTypes}
          />
          <Select
            label="Categoría"
            options={
              isLoadingCategories
                ? [{ value: "", label: "Cargando..." }]
                : projectCategories.map((category) => ({ value: category.id, label: category.name }))
            }
            value={effectiveCategoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={isLoadingCategories}
          />
        </FormRow>

        <Select
          label="Programa (opcional)"
          options={[
            { value: "", label: isLoadingPrograms ? "Cargando..." : "Sin programa asociado" },
            ...programs.map((program) => ({ value: program.id, label: program.name })),
          ]}
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
          disabled={isLoadingPrograms}
        />

        {selectedType && selectedType.templateFields.length > 0 ? (
          <DynamicTypeFields
            templateFields={selectedType.templateFields}
            typeData={typeData}
            onChange={setTypeData}
          />
        ) : null}

        <SkillPicker
          label="Habilidades técnicas y blandas conocidas"
          mode="multi"
          value={knownSkills}
          onChange={setKnownSkills}
        />

        <DeliverablesEditor value={deliverables} onChange={setDeliverables} />

        {validation ? <FormError>{validation}</FormError> : null}
      </Card>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
