"use client";

import { useState } from "react";
import { apiClient } from "@/apis/client";
import type { Need, NeedPayload } from "@/apis/interfaces/needs";

export function useCreateNeed() {
  const [isSaving, setIsSaving] = useState(false);

  const createNeed = async (payload: NeedPayload) => {
    setIsSaving(true);
    try {
      const response = await apiClient.post<Need>("/needs", payload);
      return response.data;
    } finally {
      setIsSaving(false);
    }
  };

  return { createNeed, isSaving };
}
