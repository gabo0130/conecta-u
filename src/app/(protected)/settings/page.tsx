"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Program, ProjectCategory, ProjectType, Skill, SkillCategory, SkillStatus, SkillType } from "@/apis/interfaces/catalogs";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, Input, Select } from "@/components/atoms";
import { LoadingState, Pagination } from "@/components/molecules";
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
import styles from "./settings.module.css";

type Tab = "programs" | "types" | "categories" | "skills";

const TABS: { value: Tab; label: string }[] = [
  { value: "programs", label: "Programas" },
  { value: "types", label: "Tipos de proyecto" },
  { value: "categories", label: "Categorías" },
  { value: "skills", label: "Habilidades" },
];

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
  const [modal, setModal] = useState<{ program?: Program } | null>(null);

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
                <th>Código</th>
                <th>Nombre</th>
                <th>Facultad</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id} className={styles.row} onClick={() => setModal({ program })}>
                  <td>{program.code}</td>
                  <td>{program.name}</td>
                  <td className={styles.muted}>{program.faculty ?? "—"}</td>
                  <td>
                    <Badge tone={program.active ? "green" : "gray"} dot>
                      {program.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className={styles.editCol}>
                    <Button
                      variant="link"
                      size="sm"
                      aria-label={`Editar ${program.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setModal({ program });
                      }}
                    >
                      Editar
                    </Button>
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
  const [modal, setModal] = useState<{ type?: ProjectType } | null>(null);

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
                <th>Código</th>
                <th>Nombre</th>
                <th>Campos</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {projectTypes.map((type) => (
                <tr key={type.id} className={styles.row} onClick={() => setModal({ type })}>
                  <td>{type.code}</td>
                  <td>{type.name}</td>
                  <td className={styles.muted}>{type.templateFields.length}</td>
                  <td>
                    <Badge tone={type.active ? "green" : "gray"} dot>
                      {type.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className={styles.editCol}>
                    <Button
                      variant="link"
                      size="sm"
                      aria-label={`Editar ${type.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setModal({ type });
                      }}
                    >
                      Editar
                    </Button>
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
  const [modal, setModal] = useState<{ category?: ProjectCategory } | null>(null);

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
                <th>Nombre</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {projectCategories.map((category) => (
                <tr key={category.id} className={styles.row} onClick={() => setModal({ category })}>
                  <td>{category.name}</td>
                  <td>
                    <Badge tone={category.active ? "green" : "gray"} dot>
                      {category.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className={styles.editCol}>
                    <Button
                      variant="link"
                      size="sm"
                      aria-label={`Editar ${category.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setModal({ category });
                      }}
                    >
                      Editar
                    </Button>
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
  const { skills, meta, setPage, isLoading, error, createSkill, updateSkill } = useAdminSkills({
    q: q || undefined,
    type: type || undefined,
    category: category || undefined,
    status: status || undefined,
  });
  const [modal, setModal] = useState<{ skill?: Skill } | null>(null);

  return (
    <Card padding={0}>
      <SectionHead title="Habilidades" actionLabel="Agregar habilidad" onAction={() => setModal({})} />
      <div className={styles.filters}>
        <Input placeholder="Buscar por nombre" value={q} onChange={(event) => setQ(event.target.value)} />
        <Select
          options={[{ value: "", label: "Todos los tipos" }, ...SKILL_TYPE_OPTIONS]}
          value={type}
          onChange={(event) => setType(event.target.value as SkillType | "")}
        />
        <Select
          options={[{ value: "", label: "Todas las categorías" }, ...SKILL_CATEGORY_OPTIONS]}
          value={category}
          onChange={(event) => setCategory(event.target.value as SkillCategory | "")}
        />
        <Select
          options={[{ value: "", label: "Todos los estados" }, ...SKILL_STATUS_OPTIONS]}
          value={status}
          onChange={(event) => setStatus(event.target.value as SkillStatus | "")}
        />
      </div>
      {isLoading ? <LoadingState message="Cargando habilidades…" /> : null}
      {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
      {!isLoading && !error && skills.length === 0 ? (
        <p className={styles.state}>Ninguna habilidad coincide con los filtros.</p>
      ) : null}
      {!isLoading && !error && skills.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className={styles.row} onClick={() => setModal({ skill })}>
                  <td>{skill.name}</td>
                  <td className={styles.muted}>{SKILL_TYPE_LABEL[skill.type]}</td>
                  <td className={styles.muted}>{SKILL_CATEGORY_LABEL[skill.category]}</td>
                  <td>
                    <Badge tone={SKILL_STATUS_TONE[skill.status]} dot>
                      {SKILL_STATUS_LABEL[skill.status]}
                    </Badge>
                  </td>
                  <td className={styles.editCol}>
                    <Button
                      variant="link"
                      size="sm"
                      aria-label={`Editar ${skill.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setModal({ skill });
                      }}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {!isLoading && !error && meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
      {modal ? (
        <AdminSkillModal
          skill={modal.skill}
          onCreate={createSkill}
          onUpdate={(payload) => updateSkill(modal.skill!.id, payload)}
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
