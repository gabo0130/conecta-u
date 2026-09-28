"use client";

import { useCallback, useRef, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  ProposeSkillPayload,
  Skill,
  SkillsResponse,
  SkillType,
} from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";

export function useSkillsCatalog() {
  const [skills, setSkills] = useState<Skill[]>([]);
  // Texto de la búsqueda a la que corresponden `skills`, para saber si los resultados están al día.
  const [resultsQuery, setResultsQuery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Texto cuya búsqueda falló: el picker muestra el error en vez de quedarse en "Buscando…".
  const [failedQuery, setFailedQuery] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const search = useCallback(async (q: string, type?: SkillType) => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    try {
      const response = await apiClient.get<SkillsResponse>("/catalogs/skills", {
        params: { q: q || undefined, type },
      });
      // Descarta la respuesta si ya se disparó una búsqueda más reciente (petición en carrera).
      if (requestId !== latestRequestId.current) return [];
      setSkills(response.data.skills);
      setResultsQuery(q);
      setFailedQuery(null);
      setError("");
      return response.data.skills;
    } catch (err) {
      if (requestId !== latestRequestId.current) return [];
      setError(getErrorMessage(err, "No se pudieron buscar las habilidades."));
      setFailedQuery(q);
      return [];
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false);
    }
  }, []);

  const proposeSkill = useCallback(async (payload: ProposeSkillPayload) => {
    const response = await apiClient.post<Skill>("/catalogs/skills", payload);
    return response.data;
  }, []);

  return { skills, resultsQuery, failedQuery, isLoading, error, search, proposeSkill };
}
