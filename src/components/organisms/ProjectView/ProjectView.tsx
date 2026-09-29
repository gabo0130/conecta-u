"use client";

import type { ReactNode } from "react";
import type { Project } from "@/apis/interfaces/projects";
import type { TemplateField } from "@/apis/interfaces/catalogs";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { Card, Chip, Spinner } from "../../atoms";
import { SKILL_TYPE_TONE, groupBySoftSkill } from "../SkillPicker/skill-type";
import { formatDate } from "@/utils/dates";
import styles from "./ProjectView.module.css";

type ProjectViewProps = {
  project: Project;
  /** Tarjeta extra al inicio de la columna lateral (en móvil, la primera): p. ej. datos solo para ADMIN. */
  asideTop?: ReactNode;
};

const EMPTY = "Sin definir";

function formatTypeValue(field: TemplateField | undefined, value: unknown) {
  if (value === undefined || value === null || value === "") return EMPTY;
  if (field?.kind === "date" && typeof value === "string") {
    return formatDate(value, { day: "numeric", month: "long", year: "numeric" });
  }
  return String(value);
}

/** Vista de solo lectura de un proyecto: los mismos datos que el formulario, sin campos editables. */
export function ProjectView({ project, asideTop }: ProjectViewProps) {
  const { projectTypes, isLoading: isLoadingTypes } = useProjectTypesCatalog();
  const { projectCategories, isLoading: isLoadingCategories } = useProjectCategoriesCatalog();
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();
  // Los nombres salen de catálogos del backend: mientras llegan, spinner en vez de "Sin definir".
  const pending = (isLoading: boolean, value: string) =>
    isLoading ? <Spinner size="sm" label="Cargando" /> : value;

  const type = projectTypes.find((item) => item.id === project.typeId);
  const category = projectCategories.find((item) => item.id === project.categoryId);
  const program = programs.find((item) => item.id === project.programId);
  const typeData = project.typeData ?? {};
  // Primero los campos en el orden de la plantilla del tipo; después cualquier dato extra guardado.
  const typeFields = [
    ...(type?.templateFields ?? []).map((field) => ({ key: field.key, label: field.label, field })),
    ...Object.keys(typeData)
      .filter((key) => !type?.templateFields.some((field) => field.key === key))
      .map((key) => ({ key, label: key, field: undefined })),
  ];
  const skills = project.knownSkills ?? [];
  const { technical: technicalSkills, soft: softSkills } = groupBySoftSkill(skills, (skill) => skill.type);

  return (
    // Móvil: una columna (descripción → clasificación → habilidades → entregables).
    // xl: principal (descripción y entregables) + lateral (clasificación y habilidades).
    <div className={styles.view}>
      <div className={styles.primary}>
        <Card padding={24} className={styles.desc}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Resumen</h2>
            <p className={styles.text}>{project.summary}</p>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Objetivos</h2>
            <p className={styles.text}>{project.objectives}</p>
          </section>
        </Card>
        <Card padding={24} className={styles.deliverablesCard}>
          <h2 className={styles.sectionTitle}>Entregables ({project.deliverables.length})</h2>
          {project.deliverables.length > 0 ? (
            <ol className={styles.deliverables}>
              {project.deliverables.map((deliverable, index) => (
                <li key={deliverable.id ?? index} className={styles.deliverable}>
                  <span className={styles.deliverableIndex} aria-hidden>
                    {index + 1}
                  </span>
                  <div className={styles.deliverableText}>
                    <p className={styles.deliverableName}>{deliverable.name}</p>
                    <p className={styles.deliverableScope}>{deliverable.scope}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>Aún no se registraron entregables.</p>
          )}
        </Card>
      </div>
      <div className={styles.secondary}>
        {asideTop ? <div className={styles.asideTop}>{asideTop}</div> : null}
        <Card padding={24} className={styles.classification}>
          <h2 className={styles.sectionTitle}>Clasificación</h2>
          <dl className={styles.fields}>
            <div className={styles.field}>
              <dt>Tipo de proyecto</dt>
              <dd>{pending(isLoadingTypes, type?.name ?? EMPTY)}</dd>
            </div>
            <div className={styles.field}>
              <dt>Categoría</dt>
              <dd>{pending(isLoadingCategories, category?.name ?? EMPTY)}</dd>
            </div>
            <div className={styles.field}>
              <dt>Programa</dt>
              <dd>{pending(isLoadingPrograms, program?.name ?? "Sin programa asociado")}</dd>
            </div>
            {typeFields.map(({ key, label, field }) => (
              <div key={key} className={styles.field}>
                <dt>{label}</dt>
                <dd>{formatTypeValue(field, typeData[key])}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card padding={24} className={styles.skills}>
          <h2 className={styles.sectionTitle}>Conocimientos y competencias conocidas</h2>
          {technicalSkills.length > 0 ? (
            <div className={styles.chips}>
              {technicalSkills.map((skill) => (
                <Chip key={skill.id} tone={SKILL_TYPE_TONE[skill.type]}>
                  {skill.name}
                </Chip>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Aún no se registraron conocimientos ni competencias.</p>
          )}
        </Card>
        <Card padding={24} className={styles.skills}>
          <h2 className={styles.sectionTitle}>Habilidades blandas conocidas</h2>
          {softSkills.length > 0 ? (
            <div className={styles.chips}>
              {softSkills.map((skill) => (
                <Chip key={skill.id} tone={SKILL_TYPE_TONE[skill.type]}>
                  {skill.name}
                </Chip>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Aún no se registraron habilidades blandas.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
