"use client";

import { createSharedRequest } from "@/apis/shared-request";
import type { ProjectTypesResponse } from "@/apis/interfaces/catalogs";
import { useSharedCatalog } from "../useSharedCatalog/useSharedCatalog";

export const projectTypesRequest = createSharedRequest<ProjectTypesResponse>("/catalogs/project-types");
const selectProjectTypes = (data: ProjectTypesResponse) => data.projectTypes;

export function useProjectTypesCatalog() {
  const { items, ...state } = useSharedCatalog(
    projectTypesRequest,
    selectProjectTypes,
    "No se pudieron cargar los tipos de proyecto.",
  );
  return { projectTypes: items, ...state };
}
