"use client";

import { createSharedRequest } from "@/apis/shared-request";
import type { ProgramsResponse } from "@/apis/interfaces/catalogs";
import { useSharedCatalog } from "../useSharedCatalog/useSharedCatalog";

export const programsRequest = createSharedRequest<ProgramsResponse>("/catalogs/programs");
const selectPrograms = (data: ProgramsResponse) => data.programs;

export function useProgramsCatalog() {
  const { items, ...state } = useSharedCatalog(programsRequest, selectPrograms, "No se pudieron cargar los programas.");
  return { programs: items, ...state };
}
