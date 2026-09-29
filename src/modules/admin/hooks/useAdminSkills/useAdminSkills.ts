"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  AdminCreateSkillPayload,
  AdminSkillsResponse,
  Skill,
  SkillCategory,
  SkillStatus,
  SkillType,
  UpdateSkillPayload,
} from "@/apis/interfaces/catalogs";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { getErrorMessage } from "@/utils/get-error-message";

const PAGE_SIZE = 20;

export type AdminSkillsFilters = {
  q?: string;
  type?: SkillType;
  category?: SkillCategory;
  status?: SkillStatus;
};

/** ADMIN: catálogo de habilidades paginado, con filtros (RF22) — incluye las PENDIENTE por revisar. */
export function useAdminSkills(filters: AdminSkillsFilters) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<AdminSkillsResponse>("/admin/catalogs/skills", {
        params: { page, pageSize: PAGE_SIZE, ...filters },
      });
      setSkills(response.data.skills);
      setMeta(response.data.meta);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar las habilidades."));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.q, filters.type, filters.category, filters.status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = async (request: () => Promise<unknown>) => {
    await request();
    await reload();
  };

  return {
    skills,
    meta,
    page,
    setPage,
    isLoading,
    error,
    reload,
    createSkill: (payload: AdminCreateSkillPayload) => mutate(() => apiClient.post("/admin/catalogs/skills", payload)),
    updateSkill: (id: string, payload: UpdateSkillPayload) =>
      mutate(() => apiClient.patch(`/admin/catalogs/skills/${id}`, payload)),
  };
}
