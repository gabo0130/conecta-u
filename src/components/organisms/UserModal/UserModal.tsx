"use client";

import { useState } from "react";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/apis/interfaces/admin";
import type { UserRole } from "@/apis/interfaces/auth";
import { ROLE_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Input, Modal, Select, type SelectOption } from "../../atoms";

type ActiveValue = "true" | "false";

const ACTIVE_OPTIONS: SelectOption<ActiveValue>[] = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

type UserModalProps = {
  /** Sin usuario, el modal crea una cuenta; con usuario, la edita. */
  user?: AdminUser;
  onCreate: (payload: CreateUserPayload) => Promise<unknown>;
  onUpdate: (payload: UpdateUserPayload) => Promise<unknown>;
  onDelete?: () => Promise<unknown>;
  onClose: () => void;
};

export function UserModal({ user, onCreate, onUpdate, onDelete, onClose }: UserModalProps) {
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "COLABORADOR");
  const [active, setActive] = useState<ActiveValue>(user?.active === false ? "false" : "true");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const name = fullName.trim();
    if (name.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!user && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (user) {
        await onUpdate({ fullName: name, email: email.trim(), role, active: active === "true" });
      } else {
        await onCreate({ fullName: name, email: email.trim(), password, role });
      }
      onClose();
      void notify.success(user ? "Los datos del usuario se actualizaron." : `La cuenta de ${name} quedó creada.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo guardar el usuario. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !user) return;
    const accepted = await notify.confirm({
      title: "¿Eliminar usuario?",
      message: `Se eliminará la cuenta de ${user.fullName} (${user.email}). Esta acción no se puede deshacer.`,
      tone: "danger",
    });
    if (!accepted) return;
    setIsSubmitting(true);
    setError("");
    try {
      await onDelete();
      onClose();
      void notify.success("El usuario se eliminó.");
    } catch (err) {
      // Si lidera proyectos, el backend responde 409 y pide desactivarlo: se muestra su mensaje.
      void notify.error(getErrorMessage(err, "No se pudo eliminar el usuario."));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={user ? "Editar usuario" : "Crear usuario"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={() => void handleSubmit()}
      dangerAction={onDelete ? { label: "Eliminar", onClick: () => void handleDelete() } : undefined}
    >
      <Input label="Nombre completo" maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} />
      <Input label="Correo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      {!user ? (
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      ) : null}
      <Select label="Rol" options={ROLE_OPTIONS} value={role} onValueChange={setRole} />
      {user ? <Select label="Estado" options={ACTIVE_OPTIONS} value={active} onValueChange={setActive} /> : null}
    </Modal>
  );
}
