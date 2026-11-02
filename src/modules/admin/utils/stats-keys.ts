import type { PersonType } from "@/apis/interfaces/auth";
import type { AvailabilityStatus } from "@/apis/interfaces/collaborator";
import type { ProjectStatus } from "@/apis/interfaces/projects";

// Las claves de `/admin/stats` llegan como texto: se verifican antes de usarlas como enum.
const PROJECT_STATUSES: readonly string[] = ["BORRADOR", "EN_ANALISIS", "ANALIZADO"] satisfies ProjectStatus[];
const PERSON_TYPES: readonly string[] = ["ESTUDIANTE", "DOCENTE"] satisfies PersonType[];
const AVAILABILITIES: readonly string[] = ["DISPONIBLE", "PARCIAL", "NO_DISPONIBLE"] satisfies AvailabilityStatus[];

export const isProjectStatus = (key: string): key is ProjectStatus => PROJECT_STATUSES.includes(key);
export const isPersonType = (key: string): key is PersonType => PERSON_TYPES.includes(key);
export const isAvailability = (key: string): key is AvailabilityStatus => AVAILABILITIES.includes(key);
