"use client";

import type { AdminUser } from "@/apis/interfaces/admin";
import type { SelectOption } from "@/components/atoms";
import { useAllPages } from "@/hooks/useAllPages";

/**
 * Líderes activos para registrar un proyecto a su nombre (v2.1, A5). Recorre todas las
 * páginas de usuarios: un líder de la página 3 también debe poder elegirse.
 */
export function useLeaderOptions(enabled: boolean) {
  const { items, isLoading, error } = useAllPages<AdminUser>(
    "/users",
    "users",
    enabled,
    "No se pudieron cargar los líderes.",
  );
  const options: SelectOption[] = items
    .filter((user) => user.role === "LIDER" && user.active)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"))
    .map((user) => ({ value: user.id, label: `${user.fullName} · ${user.email}` }));

  return { options, isLoading, error };
}
