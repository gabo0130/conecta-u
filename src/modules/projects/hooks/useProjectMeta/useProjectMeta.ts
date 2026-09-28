"use client";

import type { Project } from "@/apis/interfaces/projects";
import { useProjectCategoriesCatalog } from "@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import { getProjectMeta } from "../../utils/project-view";

/**
 * "Tipo · Categoría" de cada proyecto. El backend solo envía los ids, así que depende de los
 * catálogos: mientras cargan, `isLoading` es true y la lista muestra un spinner en vez de
 * "Sin tipo ni categoría".
 */
export function useProjectMeta() {
  const { projectTypes, isLoading: isLoadingTypes } = useProjectTypesCatalog();
  const { projectCategories, isLoading: isLoadingCategories } = useProjectCategoriesCatalog();
  const typeNameById = Object.fromEntries(projectTypes.map((type) => [type.id, type.name]));
  const categoryNameById = Object.fromEntries(projectCategories.map((category) => [category.id, category.name]));

  return {
    describe: (project: Pick<Project, "typeId" | "categoryId">) =>
      getProjectMeta(project, { typeNameById, categoryNameById }),
    isLoading: isLoadingTypes || isLoadingCategories,
  };
}
