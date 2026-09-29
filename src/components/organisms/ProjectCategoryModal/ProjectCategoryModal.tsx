"use client";

import { useState } from "react";
import type {
  CreateProjectCategoryPayload,
  ProjectCategory,
  UpdateProjectCategoryPayload,
} from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Checkbox, Input, Modal } from "../../atoms";

type ProjectCategoryModalProps = {
  category?: ProjectCategory;
  onCreate: (payload: CreateProjectCategoryPayload) => Promise<unknown>;
  onUpdate: (payload: UpdateProjectCategoryPayload) => Promise<unknown>;
  onClose: () => void;
};

export function ProjectCategoryModal({ category, onCreate, onUpdate, onClose }: ProjectCategoryModalProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [active, setActive] = useState(category?.active !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (category) {
        await onUpdate({ name: trimmedName, active });
      } else {
        await onCreate({ name: trimmedName });
      }
      onClose();
      void notify.success(category ? "La categoría se actualizó." : `La categoría "${trimmedName}" quedó creada.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar la categoría. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={category ? "Editar categoría" : "Crear categoría"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() => void handleSubmit()}
    >
      <Input label="Nombre" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
      {category ? (
        <Checkbox label="Activa" checked={active} onChange={(event) => setActive(event.target.checked)} />
      ) : null}
    </Modal>
  );
}
