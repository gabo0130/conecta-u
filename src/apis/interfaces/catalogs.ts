export interface Program {
  id: string;
  code: string;
  name: string;
  faculty: string;
  active: boolean;
}

export interface ProgramsResponse {
  programs: Program[];
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

export interface ProjectCategory {
  id: string;
  name: string;
  active: boolean;
}

export interface ProjectCategoriesResponse {
  projectCategories: ProjectCategory[];
}
