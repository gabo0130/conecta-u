"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Program, ProjectCategory, ProjectType, Skill, SkillCategory, SkillStatus, SkillType } from "@/apis/interfaces/catalogs";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, IconButton, Input, Select } from "@/components/atoms";
import { LoadingState, Pagination, RowActions, SortableHeader, TableStatus } from "@/components/molecules";
import {
  AdminSkillModal,
  ProgramModal,
  ProjectCategoryModal,
  ProjectTypeModal,
  RoleGuard,
} from "@/components/organisms";
import {
  SKILL_CATEGORY_LABEL,
  SKILL_CATEGORY_OPTIONS,
  SKILL_STATUS_LABEL,
  SKILL_STATUS_OPTIONS,
  SKILL_STATUS_TONE,
  SKILL_TYPE_LABEL,
  SKILL_TYPE_OPTIONS,
} from "@/components/organisms/SkillPicker/skill-type";
import { useAdminPrograms } from "@/modules/admin/hooks/useAdminPrograms/useAdminPrograms";
import { useAdminProjectCategories } from "@/modules/admin/hooks/useAdminProjectCategories/useAdminProjectCategories";
import { useAdminProjectTypes } from "@/modules/admin/hooks/useAdminProjectTypes/useAdminProjectTypes";
import { useAdminSkills } from "@/modules/admin/hooks/useAdminSkills/useAdminSkills";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedTable } from "@/hooks/usePagedTable";
import { useTableSort } from "@/hooks/useTableSort";
import { getErrorMessage } from "@/utils/get-error-message";
import type { SortAccessors } from "@/utils/sort";
import { notify } from "@/utils/notify";
import styles from "./settings.module.css";

type Tab = "programs" | "types" | "categories" | "skills";

const TABS: { value: Tab; label: string }[] = [
  { value: "programs", label: "Programas" },
  { value: "types", label: "Tipos de proyecto" },
  { value: "categories", label: "Categorías" },
  { value: "skills", label: "Habilidades" },
];

const activeLabel = (active: boolean) => (active ? "Activo" : "Inactivo");

const PROGRAM_SORT: SortAccessors<Program, "code" | "name" | "faculty" | "status"> = {
  code: (program) => program.code,
  name: (program) => program.name,
  faculty: (program) => program.faculty,
  status: (program) => activeLabel(program.active),
};

const TYPE_SORT: SortAccessors<ProjectType, "code" | "name" | "fields" | "status"> = {
  code: (type) => type.code,
  name: (type) => type.name,
  fields: (type) => type.templateFields.length,
  status: (type) => activeLabel(type.active),
};

const CATEGORY_SORT: SortAccessors<ProjectCategory, "name" | "status"> = {
  name: (category) => category.name,
  status: (category) => activeLabel(category.active),
};

const SKILL_SORT: SortAccessors<Skill, "name" | "type" | "category" | "status"> = {
  name: (skill) => skill.name,
  type: (skill) => SKILL_TYPE_LABEL[skill.type],
  category: (skill) => SKILL_CATEGORY_LABEL[skill.category],
  status: (skill) => SKILL_STATUS_LABEL[skill.status],
};

const SKILLS_PAGE_SIZE = 20;

function SectionHead({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <Button leftIcon={<Plus size={16} />} size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

function ProgramsSection() {
  const { programs, isLoading, error, createProgram, updateProgram } = useAdminPrograms();
  const [modal, setModal] = useState<{ program?: Program; readOnly?: boolean } | null>(null);
  const { sort, toggleSort, applySort } = useTableSort(PROGRAM_SORT);

  return (
    <Card padding={0}>
      <SectionHead title="Programas académicos" actionLabel="Crear programa" onAction={() => setModal({})} />
      {isLoading ? <LoadingState message="Cargando programas…" /> : null}
      {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
      {!isLoading && !error && programs.length === 0 ? <p className={styles.state}>Aún no hay programas.</p> : null}
      {!isLoading && !error && programs.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableHeader label="Código" sortKey="code" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Nombre" sortKey="name" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Facultad" sortKey="faculty" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Estado" sortKey="status" sort={sort} onSort={toggleSort} />
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {applySort(programs).map((program) => (
                <tr key={program.id} className={styles.row} onClick={() => setModal({ program, readOnly: true })}>
                  <td>{program.code}</td>
                  <td>{program.name}</td>
                  <td className={styles.muted}>{program.faculty ?? "—"}</td>
                  <td>
                    <Badge tone={program.active ? "green" : "gray"} dot>
                      {program.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className={styles.editCol}>
                    <RowActions
                      name={program.name}
                      editTooltip="Editar código, nombre, facultad o estado"
                      onView={() => setModal({ program, readOnly: true })}
                      onEdit={() => setModal({ program })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {modal ? (
        <ProgramModal
          program={modal.program}
          readOnly={modal.readOnly}
          onCreate={createProgram}
          onUpdate={(payload) => updateProgram(modal.program!.id, payload)}
          onClose={() => setModal(null)}
        />
      ) : null}
    </Card>
  );
}

function ProjectTypesSection() {
  const { projectTypes, isLoading, error, createProjectType, updateProjectType } = useAdminProjectTypes();
  const [modal, setModal] = useState<{ type?: ProjectType; readOnly?: boolean } | null>(null);
  const { sort, toggleSort, applySort } = useTableSort(TYPE_SORT);

  return (
    <Card padding={0}>
      <SectionHead title="Tipos de proyecto" actionLabel="Crear tipo" onAction={() => setModal({})} />
      {isLoading ? <LoadingState message="Cargando tipos de proyecto…" /> : null}
      {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
      {!isLoading && !error && projectTypes.length === 0 ? (
        <p className={styles.state}>Aún no hay tipos de proyecto.</p>
      ) : null}
      {!isLoading && !error && projectTypes.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableHeader label="Código" sortKey="code" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Nombre" sortKey="name" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Campos" sortKey="fields" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Estado" sortKey="status" sort={sort} onSort={toggleSort} />
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {applySort(projectTypes).map((type) => (
                <tr key={type.id} className={styles.row} onClick={() => setModal({ type, readOnly: true })}>
                  <td>{type.code}</td>
                  <td>{type.name}</td>
                  <td className={styles.muted}>{type.templateFields.length}</td>
                  <td>
                    <Badge tone={type.active ? "green" : "gray"} dot>
                      {type.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className={styles.editCol}>
                    <RowActions
                      name={type.name}
                      editTooltip="Editar el tipo y los campos de su plantilla"
                      onView={() => setModal({ type, readOnly: true })}
                      onEdit={() => setModal({ type })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {modal ? (
        <ProjectTypeModal
          type={modal.type}
          readOnly={modal.readOnly}
          onCreate={createProjectType}
          onUpdate={(payload) => updateProjectType(modal.type!.id, payload)}
          onClose={() => setModal(null)}
        />
      ) : null}
    </Card>
  );
}

function ProjectCategoriesSection() {
  const { projectCategories, isLoading, error, createProjectCategory, updateProjectCategory } =
    useAdminProjectCategories();
  const [modal, setModal] = useState<{ category?: ProjectCategory; readOnly?: boolean } | null>(null);
  const { sort, toggleSort, applySort } = useTableSort(CATEGORY_SORT);

  return (
    <Card padding={0}>
      <SectionHead title="Categorías de proyecto" actionLabel="Crear categoría" onAction={() => setModal({})} />
      {isLoading ? <LoadingState message="Cargando categorías…" /> : null}
      {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
      {!isLoading && !error && projectCategories.length === 0 ? (
        <p className={styles.state}>Aún no hay categorías de proyecto.</p>
      ) : null}
      {!isLoading && !error && projectCategories.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableHeader label="Nombre" sortKey="name" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Estado" sortKey="status" sort={sort} onSort={toggleSort} />
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {applySort(projectCategories).map((category) => (
                <tr key={category.id} className={styles.row} onClick={() => setModal({ category, readOnly: true })}>
                  <td>{category.name}</td>
                  <td>
                    <Badge tone={category.active ? "green" : "gray"} dot>
                      {category.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className={styles.editCol}>
                    <RowActions
                      name={category.name}
                      editTooltip="Editar nombre o estado"
                      onView={() => setModal({ category, readOnly: true })}
                      onEdit={() => setModal({ category })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {modal ? (
        <ProjectCategoryModal
          category={modal.category}
          readOnly={modal.readOnly}
          onCreate={createProjectCategory}
          onUpdate={(payload) => updateProjectCategory(modal.category!.id, payload)}
          onClose={() => setModal(null)}
        />
      ) : null}
    </Card>
  );
}

function SkillsSection() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<SkillType | "">("");
  const [category, setCategory] = useState<SkillCategory | "">("");
  const [status, setStatus] = useState<SkillStatus | "">("");
  const debouncedQ = useDebouncedValue(q.trim());
  // Memorizados: con un orden activo, cada cambio de filtros vuelve a traer todas las páginas.
  const filters = useMemo(
    () => ({
      q: debouncedQ || undefined,
      type: type || undefined,
      category: category || undefined,
      status: status || undefined,
    }),
    [debouncedQ, type, category, status],
  );
  const { skills, createSkill, updateSkill, approveSkill, ...server } = useAdminSkills(filters);
  const [modal, setModal] = useState<{ skill?: Skill; readOnly?: boolean } | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  // Con un orden activo se ordenan todas las habilidades que cumplen los filtros, no solo la página.
  const table = usePagedTable({
    server: { ...server, items: skills },
    url: "/admin/catalogs/skills",
    key: "skills",
    errorMessage: "No se pudieron ordenar las habilidades.",
    accessors: SKILL_SORT,
    pageSize: SKILLS_PAGE_SIZE,
    params: filters,
  });
  const { sort, toggleSort, withRefresh } = table;
  const showTable = !table.isLoading && (table.rows.length > 0 || table.isSorted);

  const handleApprove = async (skill: Skill) => {
    setApprovingId(skill.id);
    try {
      await withRefresh(approveSkill)(skill.id);
      void notify.success(`"${skill.name}" quedó aprobada y ya se puede elegir desde el catálogo.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, `No se pudo aprobar "${skill.name}".`));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <Card padding={0}>
      <SectionHead title="Habilidades" actionLabel="Agregar habilidad" onAction={() => setModal({})} />
      <div className={styles.filters}>
        <Input placeholder="Buscar por nombre" value={q} onChange={(event) => setQ(event.target.value)} />
        <Select
          options={[{ value: "", label: "Todos los tipos" }, ...SKILL_TYPE_OPTIONS]}
          value={type}
          onValueChange={setType}
        />
        <Select
          options={[{ value: "", label: "Todas las categorías" }, ...SKILL_CATEGORY_OPTIONS]}
          value={category}
          onValueChange={setCategory}
        />
        <Select
          options={[{ value: "", label: "Todos los estados" }, ...SKILL_STATUS_OPTIONS]}
          value={status}
          onValueChange={setStatus}
        />
      </div>
      {table.isLoading ? <LoadingState message="Cargando habilidades…" /> : null}
      {!table.isLoading && table.error && !showTable ? <p className={styles.state}>{table.error}</p> : null}
      {!table.isLoading && !table.error && table.rows.length === 0 ? (
        <p className={styles.state}>Ninguna habilidad coincide con los filtros.</p>
      ) : null}
      {showTable ? (
        <TableStatus
          isRefreshing={table.isRefreshing}
          error={table.error}
          onRetry={table.retry}
          onClearSort={table.isSorted ? table.clearSort : undefined}
        />
      ) : null}
      {showTable ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableHeader label="Nombre" sortKey="name" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Tipo" sortKey="type" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Categoría" sortKey="category" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Estado" sortKey="status" sort={sort} onSort={toggleSort} />
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((skill) => (
                <tr key={skill.id} className={styles.row} onClick={() => setModal({ skill, readOnly: true })}>
                  <td>{skill.name}</td>
                  <td className={styles.muted}>{SKILL_TYPE_LABEL[skill.type]}</td>
                  <td className={styles.muted}>{SKILL_CATEGORY_LABEL[skill.category]}</td>
                  <td>
                    <Badge tone={SKILL_STATUS_TONE[skill.status]} dot>
                      {SKILL_STATUS_LABEL[skill.status]}
                    </Badge>
                  </td>
                  <td className={styles.editCol} onClick={(event) => event.stopPropagation()}>
                    <div className={styles.quickActions}>
                      {skill.status === "PENDIENTE" ? (
                        <IconButton
                          variant="plain"
                          size="sm"
                          tone="success"
                          icon={<Check />}
                          label={`Aprobar ${skill.name}`}
                          tooltip="Aprobar: queda disponible en el catálogo"
                          tooltipAlign="end"
                          disabled={approvingId !== null}
                          onClick={() => void handleApprove(skill)}
                        />
                      ) : null}
                      <RowActions
                        name={skill.name}
                        editTooltip="Editar habilidad"
                        onView={() => setModal({ skill, readOnly: true })}
                        onEdit={() => setModal({ skill })}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {!table.isLoading && table.meta ? <Pagination meta={table.meta} onPageChange={table.onPageChange} /> : null}
      {modal ? (
        <AdminSkillModal
          skill={modal.skill}
          readOnly={modal.readOnly}
          onCreate={withRefresh(createSkill)}
          onUpdate={withRefresh((payload) => updateSkill(modal.skill!.id, payload))}
          onClose={() => setModal(null)}
        />
      ) : null}
    </Card>
  );
}

function CatalogsSettings() {
  const [tab, setTab] = useState<Tab>("programs");

  return (
    <PageGrid header={<h1 className={styles.h1}>Configuración</h1>}>
      <div className={styles.tabs} role="tablist" aria-label="Catálogos">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            className={[styles.tab, tab === item.value ? styles.tabActive : ""].filter(Boolean).join(" ")}
            onClick={() => setTab(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "programs" ? <ProgramsSection /> : null}
      {tab === "types" ? <ProjectTypesSection /> : null}
      {tab === "categories" ? <ProjectCategoriesSection /> : null}
      {tab === "skills" ? <SkillsSection /> : null}
    </PageGrid>
  );
}

export default function SettingsPage() {
  return (
    <AppShell>
      <RoleGuard roles={["ADMIN"]}>
        <CatalogsSettings />
      </RoleGuard>
    </AppShell>
  );
}
