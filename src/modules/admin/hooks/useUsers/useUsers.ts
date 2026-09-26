"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  AdminUser,
  AdminUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/apis/interfaces/admin";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { getErrorMessage } from "@/utils/get-error-message";

const PAGE_SIZE = 20;

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<AdminUsersResponse>("/users", {
        params: { page, pageSize: PAGE_SIZE },
      });
      setUsers(response.data.users);
      setMeta(response.data.meta);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los usuarios."));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = async (request: () => Promise<unknown>) => {
    await request();
    await reload();
  };

  return {
    users,
    meta,
    page,
    setPage,
    isLoading,
    error,
    reload,
    createUser: (payload: CreateUserPayload) => mutate(() => apiClient.post("/users", payload)),
    updateUser: (id: string, payload: UpdateUserPayload) => mutate(() => apiClient.patch(`/users/${id}`, payload)),
    deleteUser: (id: string) => mutate(() => apiClient.delete(`/users/${id}`)),
  };
}
