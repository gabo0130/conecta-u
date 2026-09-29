import type { PageMeta } from "./pagination";

export interface Program {
  id: string;
  code: string;
  name: string;
  faculty: string | null;
  active: boolean;
}

export interface ProgramsResponse {
  programs: Program[];
}

export interface CreateProgramPayload {
  code: string;
  name: string;
  faculty?: string | null;
}

export interface UpdateProgramPayload {
  name?: string;
  faculty?: string | null;
  active?: boolean;
}

export type SkillType = "CONOCIMIENTO" | "COMPETENCIA" | "HABILIDAD_BLANDA";
export type SkillCategory =
  | "LENGUAJE"
  | "FRAMEWORK"
  | "BASE_DATOS"
  | "NUBE_DEVOPS"
  | "DATOS_IA"
  | "DISENO_UX"
  | "HERRAMIENTA"
  | "METODOLOGIA"
  | "GESTION"
  | "COMUNICACION"
  | "TRABAJO_EQUIPO"
  | "LIDERAZGO"
  | "OTRA";
export type SkillStatus = "ACTIVA" | "PENDIENTE";

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  category: SkillCategory;
  synonyms: string[];
  status: SkillStatus;
}

export interface SkillsResponse {
  skills: Skill[];
}

export interface ProposeSkillPayload {
  name: string;
  type: SkillType;
  category?: SkillCategory;
}

/* ---- Gestión de catálogos por el ADMIN (RF22) ---- */

export interface AdminCreateSkillPayload {
  name: string;
  type: SkillType;
  category?: SkillCategory;
  synonyms?: string[];
  status?: SkillStatus;
}

export interface UpdateSkillPayload {
  name?: string;
  type?: SkillType;
  category?: SkillCategory;
  synonyms?: string[];
  status?: SkillStatus;
}

export interface AdminSkillsResponse {
  skills: Skill[];
  meta: PageMeta;
}

export type TemplateFieldKind = "text" | "textarea" | "number" | "date" | "select";

export interface TemplateField {
  key: string;
  label: string;
  kind: TemplateFieldKind;
  required: boolean;
  options?: string[];
}

export interface ProjectType {
  id: string;
  code: string;
  name: string;
  templateFields: TemplateField[];
  active: boolean;
}

export interface ProjectTypesResponse {
  projectTypes: ProjectType[];
}

export interface CreateProjectTypePayload {
  code: string;
  name: string;
  templateFields: TemplateField[];
}

export interface UpdateProjectTypePayload {
  name?: string;
  templateFields?: TemplateField[];
  active?: boolean;
}

export interface ProjectCategory {
  id: string;
  name: string;
  active: boolean;
}

export interface ProjectCategoriesResponse {
  projectCategories: ProjectCategory[];
}

export interface CreateProjectCategoryPayload {
  name: string;
}

export interface UpdateProjectCategoryPayload {
  name?: string;
  active?: boolean;
}
