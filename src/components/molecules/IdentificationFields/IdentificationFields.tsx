"use client";

import { useId } from "react";
import {
  COMMON_NATIONALITIES,
  DOCUMENT_TYPE_OPTIONS,
  type IdentificationErrors,
  type IdentificationForm,
} from "@/modules/collaborator/utils/identification";
import { FormRow, Input, Select } from "../../atoms";

type IdentificationFieldsProps = {
  value: IdentificationForm;
  onChange: <K extends keyof IdentificationForm>(field: K, value: IdentificationForm[K]) => void;
  errors?: IdentificationErrors;
  disabled?: boolean;
  /** El documento ya está guardado y quien edita no puede cambiarlo (solo el ADMIN). */
  documentLocked?: boolean;
};

/**
 * Identificación y contacto de una persona (v2.1, A1–A4): mismos campos en el registro, la
 * creación de usuarios, "Mi perfil" y la vista del ADMIN.
 */
export function IdentificationFields({
  value,
  onChange,
  errors = {},
  disabled = false,
  documentLocked = false,
}: IdentificationFieldsProps) {
  const nationalitiesId = useId();
  const lockedHelp = documentLocked ? "Solo el administrador puede cambiarlo." : undefined;

  return (
    <>
      <FormRow>
        <Select
          label="Tipo de documento"
          options={DOCUMENT_TYPE_OPTIONS}
          value={value.documentType}
          onValueChange={(type) => onChange("documentType", type)}
          disabled={disabled || documentLocked}
          helperText={lockedHelp}
        />
        <Input
          label="Número de documento"
          inputMode={value.documentType === "PPT" || value.documentType === "PA" ? "text" : "numeric"}
          autoComplete="off"
          maxLength={25}
          value={value.documentNumber}
          onChange={(event) => onChange("documentNumber", event.target.value)}
          disabled={disabled || documentLocked}
          error={errors.documentNumber}
          helperText={documentLocked ? lockedHelp : "Sin puntos ni espacios."}
        />
      </FormRow>
      <FormRow>
        <Input
          label="Teléfono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="3001234567"
          maxLength={25}
          value={value.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          disabled={disabled}
          error={errors.phone}
        />
        <Input
          label="Nacionalidad"
          list={nationalitiesId}
          maxLength={60}
          value={value.nationality}
          onChange={(event) => onChange("nationality", event.target.value)}
          disabled={disabled}
          error={errors.nationality}
          helperText="Elige una o escribe otra."
        />
        <datalist id={nationalitiesId}>
          {COMMON_NATIONALITIES.map((nationality) => (
            <option key={nationality} value={nationality} />
          ))}
        </datalist>
      </FormRow>
      <FormRow>
        <Input
          label="Correo alterno (opcional)"
          type="email"
          autoComplete="email"
          value={value.alternateEmail}
          onChange={(event) => onChange("alternateEmail", event.target.value)}
          disabled={disabled}
          error={errors.alternateEmail}
          helperText="Por si pierdes el acceso al institucional."
        />
        <Input
          label="Código institucional (opcional)"
          maxLength={20}
          value={value.institutionalCode}
          onChange={(event) => onChange("institutionalCode", event.target.value)}
          disabled={disabled}
          error={errors.institutionalCode}
        />
      </FormRow>
    </>
  );
}
