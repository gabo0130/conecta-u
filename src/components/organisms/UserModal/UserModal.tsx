"use client";

import { useState } from "react";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/apis/interfaces/admin";
import type { UserRole } from "@/apis/interfaces/auth";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Input, Modal, Select } from "../../atoms";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "LIDER", label: "Líder de proyecto" },
  { value: "COLABORADOR", label: "Colaborador" },
  { value: "ADMIN", label: "Administrador" },
];

const ACTIVE_OPTIONS = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

type UserModalProps = {
  user?: AdminUser;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => Promise<unknown>;
  onDelete?: () => Promise<unknown>;
  onClose: () => void;
};

export function UserModal({ user, onSubmit, onDelete, onClose }: UserModalProps) {
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "COLABORADOR");
  const [active, setActive] = useState(user ? String(user.active) : "true");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (fullName.trim().length < 2) {
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
      const payload = user
        ? ({ fullName: fullName.trim(), email: email.trim(), role, active: active === "true" } as UpdateUserPayload)
        : ({ fullName: fullName.trim(), email: email.trim(), password, role } as CreateUserPayload);
      await onSubmit(payload);
      onClose();
      void notify.success(user ? "Los datos del usuario se actualizaron." : `La cuenta de ${fullName.trim()} quedó creada.`);
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
      <Input
        label="Correo"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {!user ? (
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      ) : null}
      <Select
        label="Rol"
        options={ROLE_OPTIONS}
        value={role}
        onChange={(event) => setRole(event.target.value as UserRole)}
      />
      {user ? (
        <Select
          label="Estado"
          options={ACTIVE_OPTIONS}
          value={active}
          onChange={(event) => setActive(event.target.value)}
        />
      ) : null}
    </Modal>
  );
}
