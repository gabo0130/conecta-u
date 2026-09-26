"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/apis/client";
import type {
  AdminUser,
  AdminUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/apis/interfaces/admin";
import { getErrorMessage } from "@/utils/get-error-message";

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await apiClient.get<AdminUsersResponse>("/users");
      setUsers(response.data.users);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los usuarios."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = async (request: () => Promise<unknown>) => {
    await request();
    await reload();
  };

  return {
    users,
    isLoading,
    error,
    reload,
    createUser: (payload: CreateUserPayload) => mutate(() => apiClient.post("/users", payload)),
    updateUser: (id: string, payload: UpdateUserPayload) => mutate(() => apiClient.patch(`/users/${id}`, payload)),
    deleteUser: (id: string) => mutate(() => apiClient.delete(`/users/${id}`)),
  };
}
