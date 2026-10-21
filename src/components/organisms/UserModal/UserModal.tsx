"use client";

import { useState } from "react";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/apis/interfaces/admin";
import type { PersonType, UserRole } from "@/apis/interfaces/auth";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { PERSON_TYPE_OPTIONS, ROLE_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import {
  type IdentificationErrors,
  type IdentificationForm,
  hasErrors,
  toIdentificationForm,
  toIdentificationPayload,
  validateIdentification,
} from "@/modules/collaborator/utils/identification";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { FormRow, Input, Modal, Select, type SelectOption } from "../../atoms";
import { IdentificationFields } from "../../molecules";

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
  /** Modo vista: el mismo formulario con todo deshabilitado. */
  readOnly?: boolean;
};

export function UserModal({ user, onCreate, onUpdate, onDelete, onClose, readOnly = false }: UserModalProps) {
  const isCreating = !user;
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "COLABORADOR");
  const [active, setActive] = useState<ActiveValue>(user?.active === false ? "false" : "true");
  // v2.1: al crear una cuenta se crea (o vincula) su persona con la identificación.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personType, setPersonType] = useState<PersonType>("ESTUDIANTE");
  const [programId, setProgramId] = useState("");
  const [identification, setIdentification] = useState<IdentificationForm>(() => toIdentificationForm());
  const [identificationErrors, setIdentificationErrors] = useState<IdentificationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();

  const updateIdentification = <K extends keyof IdentificationForm>(field: K, value: IdentificationForm[K]) => {
    setIdentification((current) => ({ ...current, [field]: value }));
    setIdentificationErrors((current) => ({ ...current, [field]: undefined }));
  };

  const createError = (): string | null => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return "Nombres y apellidos deben tener al menos 2 caracteres.";
    }
    if (!programId) return "Selecciona el programa de la persona.";
    const errors = validateIdentification(identification, email);
    setIdentificationErrors(errors);
    return hasErrors(errors) ? "Revisa los datos de identificación." : null;
  };

  const handleSubmit = async () => {
    const name = isCreating ? `${firstName.trim()} ${lastName.trim()}`.trim() : fullName.trim();
    if (!isCreating && name.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const validationError = isCreating ? createError() : null;
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (user) {
        await onUpdate({ fullName: name, email: email.trim(), role, active: active === "true" });
      } else {
        await onCreate({
          fullName: name,
          email: email.trim(),
          password,
          role,
          collaborator: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            personType,
            programId,
            ...toIdentificationPayload(identification),
          },
        });
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
      readOnly={readOnly}
      title={readOnly ? "Detalle del usuario" : user ? "Editar usuario" : "Crear usuario"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      width={isCreating ? "wide" : "narrow"}
      onSubmit={() => void handleSubmit()}
      dangerAction={onDelete ? { label: "Eliminar", onClick: () => void handleDelete() } : undefined}
    >
      {isCreating ? (
        <FormRow>
          <Input label="Nombres" maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          <Input label="Apellidos" maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </FormRow>
      ) : (
        <Input label="Nombre completo" maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} />
      )}
      <FormRow columns={isCreating ? 2 : 1}>
        <Input label="Correo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        {isCreating ? (
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        ) : null}
      </FormRow>
      <FormRow columns={isCreating ? 2 : 1}>
        <Select label="Rol" options={ROLE_OPTIONS} value={role} onValueChange={setRole} />
        {isCreating ? (
          <Select label="Tipo de persona" options={PERSON_TYPE_OPTIONS} value={personType} onValueChange={setPersonType} />
        ) : (
          <Select label="Estado" options={ACTIVE_OPTIONS} value={active} onValueChange={setActive} />
        )}
      </FormRow>
      {isCreating ? (
        <>
          <Select
            label="Programa"
            options={[
              { value: "", label: isLoadingPrograms ? "Cargando programas…" : "Selecciona un programa" },
              ...programs.map((program) => ({ value: program.id, label: program.name })),
            ]}
            value={programId}
            onChange={(event) => setProgramId(event.target.value)}
            isLoading={isLoadingPrograms}
          />
          <IdentificationFields
            value={identification}
            onChange={updateIdentification}
            errors={identificationErrors}
            disabled={isSubmitting}
          />
        </>
      ) : null}
    </Modal>
  );
}
