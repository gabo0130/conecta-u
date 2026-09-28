"use client";

import { createSharedRequest } from "@/apis/shared-request";
import type { ProjectCategoriesResponse } from "@/apis/interfaces/catalogs";
import { useSharedCatalog } from "../useSharedCatalog/useSharedCatalog";

export const projectCategoriesRequest = createSharedRequest<ProjectCategoriesResponse>("/catalogs/project-categories");
const selectProjectCategories = (data: ProjectCategoriesResponse) => data.projectCategories;

export function useProjectCategoriesCatalog() {
  const { items, ...state } = useSharedCatalog(
    projectCategoriesRequest,
    selectProjectCategories,
    "No se pudieron cargar las categorías de proyecto.",
  );
  return { projectCategories: items, ...state };
}
