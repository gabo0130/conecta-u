export type ProjectStatus = "BORRADOR" | "EN_ANALISIS" | "ANALIZADO";

export interface Project {
  id: string;
  title: string;
  summary: string;
  objectives: string;
  knownSkills: string[] | null;
  semillero: string | null;
  program: string | null;
  leaderId: string;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectPayload {
  title: string;
  summary: string;
  objectives: string;
  knownSkills?: string[];
  semillero?: string;
  program?: string;
}

export interface ProjectListResponse {
  projects: Project[];
}
