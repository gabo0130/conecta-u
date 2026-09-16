"use client";

import { useState } from "react";
import { apiClient } from "@/apis/client";
import type { RegisterPayload, RegisterResponse } from "@/apis/interfaces/auth";

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<RegisterResponse>("/auth/register", payload);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading };
}
