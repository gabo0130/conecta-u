"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/apis/client";
import { getErrorMessage } from "@/utils/get-error-message";

type Status = "idle" | "sending" | "done";

/** Recuperar contraseña: pide el enlace al correo (`POST /auth/password/forgot`). */
export function useForgotPassword() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const request = useCallback(async (email: string) => {
    setStatus("sending");
    setError("");
    try {
      const response = await apiClient.post<{ message: string }>("/auth/password/forgot", { email });
      setMessage(response.data.message);
      setStatus("done");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo enviar la solicitud. Intenta de nuevo."));
      setStatus("idle");
    }
  }, []);

  return { request, status, message, error };
}

/** Crear contraseña nueva con el token del enlace (`/auth/password/reset/check` y `/reset`). */
export function useResetPassword() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const check = useCallback(async (token: string) => {
    try {
      const response = await apiClient.post<{ valid: boolean }>("/auth/password/reset/check", { token });
      return response.data.valid;
    } catch {
      return false;
    }
  }, []);

  const reset = useCallback(async (token: string, password: string) => {
    setIsSaving(true);
    setError("");
    try {
      await apiClient.post("/auth/password/reset", { token, password });
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cambiar la contraseña. Intenta de nuevo."));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { check, reset, isSaving, error };
}
