"use client";

import { useState } from "react";
import type { Skill } from "@/apis/interfaces/catalogs";
import type { Deliverable, Project, ProjectPayload } from "@/apis/interfaces/projects";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { missingRequiredFields,
  tagsCountError, pickTemplateData } from "@/modules/projects/utils/type-data";
import { validateInteger } from "@/modules/collaborator/utils/collaborator-limits";
import { PROJECT_DURATION_MONTHS, PROJECT_ENTITY_MAX_LENGTH } from "@/modules/projects/utils/project-limits";
import { DeliverablesEditor } from "../../molecules/DeliverablesEditor/DeliverablesEditor";
import { Button, Card, FormError, FormRow, Input, Select, Textarea } from "../../atoms";
import type { ControlSize } from "../../atoms";
import { DynamicTypeFields } from "../DynamicTypeFields/DynamicTypeFields";
import { SkillPicker } from "../SkillPicker/SkillPicker";
import styles from "./ProjectForm.module.css";

const EMPTY_DELIVERABLES: Deliverable[] = [{ name: "", scope: "" }];

/** Valores con que se precarga un proyecto nuevo (p. ej. desde una necesidad, tesis T10). */
export type ProjectDefaults = {
  title?: string;
  summary?: string;
  objectives?: string;
  executingEntity?: string | null;
  durationMonths?: number | null;
  typeId?: string | null;
  knownSkills?: Skill[];
  deliverables?: Deliverable[];
};

type ProjectFormProps = {
  initial?: Project;
  /** Solo al crear: precarga los campos, pero el formulario sigue en modo «nuevo». */
  defaults?: ProjectDefaults;
  submitLabel: string;
  isSaving: boolean;
  onSubmit: (payload: ProjectPayload) => void;
  onCancel: () => void;
  /** Tamaño de todos los campos y botones del formulario. */
  size?: ControlSize;
};

export function ProjectForm({ initial, defaults, submitLabel, isSaving, onSubmit, onCancel, size }: ProjectFormProps) {
  const start = initial ?? defaults;
  const { projectTypes, isLoading: isLoadingTypes, error: typesError } = useProjectTypesCatalog();
  const { projectCategories, isLoading: isLoadingCategories, error: categoriesError } = useProjectCategoriesCatalog();
  const { programs, isLoading: isLoadingPrograms, error: programsError } = useProgramsCatalog();

  const [title, setTitle] = useState(start?.title ?? "");
  const [summary, setSummary] = useState(start?.summary ?? "");
  const [objectives, setObjectives] = useState(start?.objectives ?? "");
  const [executingEntity, setExecutingEntity] = useState(start?.executingEntity ?? "");
  const [sponsorEntity, setSponsorEntity] = useState(initial?.sponsorEntity ?? "");
  const [durationMonths, setDurationMonths] = useState(start?.durationMonths?.toString() ?? "");
  const [typeId, setTypeId] = useState(start?.typeId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [programId, setProgramId] = useState(initial?.programId ?? "");
  const [typeData, setTypeData] = useState<Record<string, unknown>>(initial?.typeData ?? {});
  const [knownSkills, setKnownSkills] = useState<Skill[]>(start?.knownSkills ?? []);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    start?.deliverables && start.deliverables.length > 0 ? start.deliverables : EMPTY_DELIVERABLES,
  );
  const [validation, setValidation] = useState("");

  // En creación, antes de que el usuario elija, se preselecciona el primer tipo/categoría del catálogo.
  const effectiveTypeId = typeId || (!initial ? (projectTypes[0]?.id ?? "") : "");
  const effectiveCategoryId = categoryId || (!initial ? (projectCategories[0]?.id ?? "") : "");

  const selectedType = projectTypes.find((type) => type.id === effectiveTypeId);

  // Al cambiar de tipo, los campos del tipo anterior se descartan: ya no se ven y el backend los
  // rechaza como desconocidos. Se conservan los que ambos tipos comparten.
  const handleTypeChange = (nextTypeId: string) => {
    const nextType = projectTypes.find((type) => type.id === nextTypeId);
    setTypeId(nextTypeId);
    setTypeData((current) => pickTemplateData(nextType?.templateFields ?? [], current));
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
    // Al crear son obligatorias; un proyecto anterior a v2.2 se puede editar sin completarlas.
    const requiresEntities = !initial || initial.executingEntity !== null || initial.durationMonths !== null;
    if (requiresEntities && !executingEntity.trim()) {
      setValidation("Indica la entidad ejecutora del proyecto.");
      return;
    }
    const durationError = validateInteger(durationMonths, PROJECT_DURATION_MONTHS, {
      label: "La duración (meses)",
      required: requiresEntities,
    });
    if (durationError) {
      setValidation(durationError);
      return;
    }
    if (!effectiveTypeId || !effectiveCategoryId || !selectedType) {
      setValidation("Selecciona el tipo y la categoría del proyecto.");
      return;
    }
    const missing = missingRequiredFields(selectedType.templateFields, typeData);
    if (missing.length > 0) {
      setValidation(
        `Completa los campos obligatorios de ${selectedType.name}: ${missing.map((field) => field.label).join(", ")}.`,
      );
      return;
    }
    const tagsError = tagsCountError(selectedType.templateFields, typeData);
    if (tagsError) {
      setValidation(tagsError);
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
      executingEntity: executingEntity.trim() || undefined,
      // Al editar, vaciar la patrocinadora envía null para que el backend la borre.
      sponsorEntity: sponsorEntity.trim() || (initial ? null : undefined),
      durationMonths: durationMonths.trim() ? Number(durationMonths) : undefined,
      typeId: effectiveTypeId,
      categoryId: effectiveCategoryId,
      // Al editar, quitar el programa envía null para que el backend lo borre.
      programId: programId || (initial ? null : undefined),
      typeData: pickTemplateData(selectedType.templateFields, typeData),
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
          <Input
            label="Entidad ejecutora"
            placeholder="Ej. Universidad Francisco de Paula Santander"
            maxLength={PROJECT_ENTITY_MAX_LENGTH}
            value={executingEntity}
            onChange={(event) => setExecutingEntity(event.target.value)}
          />
          <Input
            label="Entidad patrocinadora (opcional)"
            placeholder="Quién financia o apoya el proyecto"
            maxLength={PROJECT_ENTITY_MAX_LENGTH}
            value={sponsorEntity}
            onChange={(event) => setSponsorEntity(event.target.value)}
          />
        </FormRow>

        <Input
          label="Duración (meses)"
          type="number"
          inputMode="numeric"
          min={PROJECT_DURATION_MONTHS.min}
          max={PROJECT_DURATION_MONTHS.max}
          helperText={`Entre ${PROJECT_DURATION_MONTHS.min} y ${PROJECT_DURATION_MONTHS.max} meses.`}
          value={durationMonths}
          onChange={(event) => setDurationMonths(event.target.value)}
        />

        <FormRow>
          <Select
            label="Tipo de proyecto"
            options={
              isLoadingTypes
                ? [{ value: "", label: "Cargando…" }]
                : projectTypes.map((type) => ({ value: type.id, label: type.name }))
            }
            value={effectiveTypeId}
            onChange={(event) => handleTypeChange(event.target.value)}
            isLoading={isLoadingTypes}
            error={typesError || undefined}
          />
          <Select
            label="Categoría"
            options={
              isLoadingCategories
                ? [{ value: "", label: "Cargando…" }]
                : projectCategories.map((category) => ({ value: category.id, label: category.name }))
            }
            value={effectiveCategoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            isLoading={isLoadingCategories}
            error={categoriesError || undefined}
          />
        </FormRow>

        <Select
          label="Programa (opcional)"
          options={[
            { value: "", label: isLoadingPrograms ? "Cargando…" : "Sin programa asociado" },
            ...programs.map((program) => ({ value: program.id, label: program.name })),
          ]}
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
          isLoading={isLoadingPrograms}
          error={programsError || undefined}
        />

        {selectedType && selectedType.templateFields.length > 0 ? (
          <DynamicTypeFields
            templateFields={selectedType.templateFields}
            typeData={typeData}
            onChange={setTypeData}
          />
        ) : null}

        <SkillPicker
          label="Competencias técnicas y blandas requeridas por el proyecto"
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
          {isSaving ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
