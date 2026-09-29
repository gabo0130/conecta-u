"use client";

import { useState } from "react";
import type { CreateProjectTypePayload, ProjectType, TemplateField, UpdateProjectTypePayload } from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Checkbox, Input, Modal } from "../../atoms";
import { TemplateFieldsEditor } from "../../molecules";

const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*$/;

type ProjectTypeModalProps = {
  type?: ProjectType;
  onCreate: (payload: CreateProjectTypePayload) => Promise<unknown>;
  onUpdate: (payload: UpdateProjectTypePayload) => Promise<unknown>;
  onClose: () => void;
};

function validateFields(fields: TemplateField[]): string | null {
  const seenKeys = new Set<string>();
  for (const field of fields) {
    if (!field.key.trim() || !field.label.trim()) return "Cada campo necesita una clave y una etiqueta.";
    if (!KEY_PATTERN.test(field.key)) return `La clave "${field.key}" solo puede tener letras y números, sin espacios.`;
    if (seenKeys.has(field.key)) return `La clave "${field.key}" está repetida.`;
    seenKeys.add(field.key);
    if (field.kind === "select" && (field.options ?? []).length === 0) {
      return `El campo "${field.label}" es de tipo lista y necesita al menos una opción.`;
    }
  }
  return null;
}

export function ProjectTypeModal({ type, onCreate, onUpdate, onClose }: ProjectTypeModalProps) {
  const [code, setCode] = useState(type?.code ?? "");
  const [name, setName] = useState(type?.name ?? "");
  const [templateFields, setTemplateFields] = useState<TemplateField[]>(type?.templateFields ?? []);
  const [active, setActive] = useState(type?.active !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!type && code.trim().length < 2) {
      setError("El código debe tener al menos 2 caracteres.");
      return;
    }
    const fieldsError = validateFields(templateFields);
    if (fieldsError) {
      setError(fieldsError);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (type) {
        await onUpdate({ name: trimmedName, templateFields, active });
      } else {
        await onCreate({ code: code.trim(), name: trimmedName, templateFields });
      }
      onClose();
      void notify.success(type ? "El tipo de proyecto se actualizó." : `El tipo "${trimmedName}" quedó creado.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar el tipo de proyecto. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={type ? "Editar tipo de proyecto" : "Crear tipo de proyecto"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() => void handleSubmit()}
    >
      {!type ? (
        <Input label="Código" maxLength={40} value={code} onChange={(event) => setCode(event.target.value)} />
      ) : null}
      <Input label="Nombre" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
      <TemplateFieldsEditor value={templateFields} onChange={setTemplateFields} />
      {type ? (
        <Checkbox label="Activo" checked={active} onChange={(event) => setActive(event.target.checked)} />
      ) : null}
    </Modal>
  );
}
