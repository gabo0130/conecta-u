"use client";

import type { StatsFilters } from "@/apis/interfaces/admin";
import type { PersonType } from "@/apis/interfaces/auth";
import { PERSON_TYPE_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { Button, Input, Select, Spinner } from "../../atoms";
import styles from "./StatsFiltersBar.module.css";

type StatsFiltersBarProps = {
  value: StatsFilters;
  onChange: (filters: StatsFilters) => void;
  isRefreshing?: boolean;
};

const ALL = "";

/** Si el rango queda invertido, el cambio mueve la otra fecha para no pedir un rango imposible. */
function withDate(filters: StatsFilters, field: "from" | "to", day: string): StatsFilters {
  const next = { ...filters, [field]: day || undefined };
  if (next.from && next.to && next.from > next.to) {
    if (field === "from") next.to = next.from;
    else next.from = next.to;
  }
  return next;
}

/**
 * HU-14: filtros del dashboard en una sola fila sobre los gráficos. Las fechas, el tipo y la
 * categoría acotan los datos de proyectos; el programa y el tipo de persona, los de personas.
 */
export function StatsFiltersBar({ value, onChange, isRefreshing = false }: StatsFiltersBarProps) {
  const { projectTypes, isLoading: loadingTypes } = useProjectTypesCatalog();
  const { projectCategories, isLoading: loadingCategories } = useProjectCategoriesCatalog();
  const { programs, isLoading: loadingPrograms } = useProgramsCatalog();
  const active = Object.values(value).filter(Boolean).length;

  const set = (patch: StatsFilters) => onChange({ ...value, ...patch });

  return (
    <section className={styles.bar} aria-label="Filtros de las estadísticas">
      <div className={styles.group}>
        <span className={styles.groupLabel}>Proyectos</span>
        <div className={styles.fields}>
          <Input
            label="Desde"
            type="date"
            size="sm"
            value={value.from ?? ""}
            max={value.to}
            onChange={(event) => onChange(withDate(value, "from", event.target.value))}
          />
          <Input
            label="Hasta"
            type="date"
            size="sm"
            value={value.to ?? ""}
            min={value.from}
            onChange={(event) => onChange(withDate(value, "to", event.target.value))}
          />
          <Select
            label="Tipo"
            size="sm"
            isLoading={loadingTypes}
            options={[
              { value: ALL, label: "Todos los tipos" },
              ...projectTypes.map((type) => ({
                value: type.id,
                label: type.name,
              })),
            ]}
            value={value.projectTypeId ?? ALL}
            onValueChange={(id) => set({ projectTypeId: id || undefined })}
          />
          <Select
            label="Categoría"
            size="sm"
            isLoading={loadingCategories}
            options={[
              { value: ALL, label: "Todas las categorías" },
              ...projectCategories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
            value={value.categoryId ?? ALL}
            onValueChange={(id) => set({ categoryId: id || undefined })}
          />
        </div>
      </div>
      <div className={styles.group}>
        <span className={styles.groupLabel}>Personas</span>
        <div className={styles.fields}>
          <Select
            label="Programa"
            size="sm"
            isLoading={loadingPrograms}
            options={[
              { value: ALL, label: "Todos los programas" },
              ...programs.map((program) => ({
                value: program.id,
                label: program.name,
              })),
            ]}
            value={value.programId ?? ALL}
            onValueChange={(id) => set({ programId: id || undefined })}
          />
          <Select<PersonType | typeof ALL>
            label="Tipo de persona"
            size="sm"
            options={[{ value: ALL, label: "Estudiantes y docentes" }, ...PERSON_TYPE_OPTIONS]}
            value={value.personType ?? ALL}
            onValueChange={(type) => set({ personType: type || undefined })}
          />
        </div>
      </div>
      <div className={styles.actions}>
        {isRefreshing ? <Spinner size="sm" label="Actualizando estadísticas" /> : null}
        <Button variant="ghost" size="sm" onClick={() => onChange({})} disabled={active === 0}>
          Limpiar filtros{active > 0 ? ` (${active})` : ""}
        </Button>
      </div>
    </section>
  );
}
