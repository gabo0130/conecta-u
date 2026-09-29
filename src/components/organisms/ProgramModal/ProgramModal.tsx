"use client";

import { useState } from "react";
import type { CreateProgramPayload, Program, UpdateProgramPayload } from "@/apis/interfaces/catalogs";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Checkbox, Input, Modal } from "../../atoms";

type ActiveValue = "true" | "false";

type ProgramModalProps = {
  /** Sin programa, el modal crea uno; con programa, lo edita. */
  program?: Program;
  onCreate: (payload: CreateProgramPayload) => Promise<unknown>;
  onUpdate: (payload: UpdateProgramPayload) => Promise<unknown>;
  onClose: () => void;
};

export function ProgramModal({ program, onCreate, onUpdate, onClose }: ProgramModalProps) {
  const [code, setCode] = useState(program?.code ?? "");
  const [name, setName] = useState(program?.name ?? "");
  const [faculty, setFaculty] = useState(program?.faculty ?? "");
  const [active, setActive] = useState<ActiveValue>(program?.active === false ? "false" : "true");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!program && code.trim().length < 2) {
      setError("El código debe tener al menos 2 caracteres.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (program) {
        await onUpdate({ name: trimmedName, faculty: faculty.trim() || null, active: active === "true" });
      } else {
        await onCreate({ code: code.trim(), name: trimmedName, faculty: faculty.trim() || null });
      }
      onClose();
      void notify.success(program ? "El programa se actualizó." : `El programa "${trimmedName}" quedó creado.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar el programa. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={program ? "Editar programa" : "Crear programa"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() => void handleSubmit()}
    >
      {!program ? (
        <Input label="Código" maxLength={20} value={code} onChange={(event) => setCode(event.target.value)} />
      ) : null}
      <Input label="Nombre" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      <Input
        label="Facultad (opcional)"
        maxLength={120}
        value={faculty}
        onChange={(event) => setFaculty(event.target.value)}
      />
      {program ? (
        <Checkbox
          label="Activo"
          checked={active === "true"}
          onChange={(event) => setActive(event.target.checked ? "true" : "false")}
        />
      ) : null}
    </Modal>
  );
}
