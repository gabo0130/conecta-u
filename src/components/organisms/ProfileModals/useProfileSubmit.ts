"use client";

import { useState } from "react";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";

export type SubmitFn<T> = (payload: T) => Promise<unknown>;

export const clean = (value: string) => value.trim();
/** Texto opcional: vacío → null, así se puede borrar un valor guardado. */
export const optionalText = (value: string) => clean(value) || null;

/**
 * Envío de los modales del perfil: las validaciones del formulario se muestran en línea (`error`);
 * el resultado de la acción (éxito o error del backend) se notifica en un modal.
 */
export function useProfileSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<unknown>, onDone: () => void, successMessage: string) => {
    setIsSubmitting(true);
    setError("");
    try {
      await action();
      onDone();
      void notify.success(successMessage);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (
    message: string,
    action: () => Promise<unknown>,
    onDone: () => void,
    successMessage: string,
  ) => {
    if (await notify.confirm({ message, tone: "danger" })) await run(action, onDone, successMessage);
  };

  /** Muestra el primer error de la lista; devuelve true si hubo alguno. */
  const failWith = (...messages: (string | null)[]) => {
    const first = messages.find(Boolean);
    if (first) setError(first);
    return Boolean(first);
  };

  return { isSubmitting, error, setError, run, confirmDelete, failWith };
}
