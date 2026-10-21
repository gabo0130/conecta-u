"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCreateUser } from "@/modules/auth/hooks/useCreateUser/useCreateUser";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import type { PersonType, RegisterRole } from "@/apis/interfaces/auth";
import { getErrorMessage } from "@/utils/get-error-message";
import {
  PERSON_TYPE_OPTIONS,
  REGISTERABLE_ROLE_OPTIONS,
} from "@/modules/collaborator/utils/collaborator-view";
import {
  type IdentificationErrors,
  type IdentificationForm,
  hasErrors,
  toIdentificationForm,
  toIdentificationPayload,
  validateIdentification,
} from "@/modules/collaborator/utils/identification";
import { notify } from "@/utils/notify";
import { Button, Checkbox, FormError, FormRow, Input, Select } from "../../atoms";
import type { ControlSize } from "../../atoms";
import { IdentificationFields } from "../../molecules";
import styles from "./RegisterForm.module.css";

type RegisterFormProps = {
  /** Tamaño de todos los campos y botones del formulario. */
  size?: ControlSize;
};

/** RF1 + v2.1: toda cuenta (líder o colaborador) queda vinculada a una persona identificada. */
export function RegisterForm({ size }: RegisterFormProps) {
  const router = useRouter();
  const { createUser, isLoading } = useCreateUser();
  const { programs, isLoading: isLoadingPrograms, error: programsError } = useProgramsCatalog();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RegisterRole>("COLABORADOR");
  const [personType, setPersonType] = useState<PersonType>("ESTUDIANTE");
  const [programId, setProgramId] = useState("");
  const [identification, setIdentification] = useState<IdentificationForm>(() => toIdentificationForm());
  const [identificationErrors, setIdentificationErrors] = useState<IdentificationErrors>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [error, setError] = useState("");

  const updateIdentification = <K extends keyof IdentificationForm>(field: K, value: IdentificationForm[K]) => {
    setIdentification((current) => ({ ...current, [field]: value }));
    setIdentificationErrors((current) => ({ ...current, [field]: undefined }));
  };

  /** Mensaje del primer error del formulario o null. */
  const validate = (): string | null => {
    if (!email || !password || !confirmPassword) return "Por favor completa todos los campos";
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return "Nombres y apellidos deben tener al menos 2 caracteres";
    }
    if (!programId) return "Selecciona tu programa académico";
    const errors = validateIdentification(identification, email);
    setIdentificationErrors(errors);
    if (hasErrors(errors)) return "Revisa tus datos de identificación";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
    if (!acceptsTerms) return "Debes aceptar los términos de uso";
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    setError(validationError ?? "");
    if (validationError) return;

    try {
      await createUser({
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email,
        password,
        role,
        collaborator: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          personType,
          programId,
          ...toIdentificationPayload(identification),
          // La casilla es obligatoria para registrarse; se envía para que quede guardada.
          dataConsent: acceptsTerms,
        },
      });
      router.push("/login");
      void notify.success("Ya puedes iniciar sesión con tu correo y contraseña.", { title: "Cuenta creada" });
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo crear la cuenta. Intenta nuevamente."), {
        title: "No pudimos crear tu cuenta",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} data-size={size} noValidate>
      <FormRow>
        <Input
          label="Nombres"
          placeholder="Tus nombres"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          disabled={isLoading}
        />
        <Input
          label="Apellidos"
          placeholder="Tus apellidos"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          disabled={isLoading}
        />
      </FormRow>
      <Input
        label="Correo institucional"
        type="email"
        placeholder="nombre@ufps.edu.co"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isLoading}
      />

      <FormRow>
        <Select
          label="Rol"
          options={REGISTERABLE_ROLE_OPTIONS}
          value={role}
          onValueChange={setRole}
          disabled={isLoading}
        />
        <Select
          label="Tipo de persona"
          options={PERSON_TYPE_OPTIONS}
          value={personType}
          onValueChange={setPersonType}
          disabled={isLoading}
        />
      </FormRow>

      <Select
        label="Programa"
        options={[
          { value: "", label: isLoadingPrograms ? "Cargando programas…" : "Selecciona un programa" },
          ...programs.map((program) => ({ value: program.id, label: program.name })),
        ]}
        value={programId}
        onChange={(event) => setProgramId(event.target.value)}
        disabled={isLoading}
        isLoading={isLoadingPrograms}
        error={programsError || undefined}
      />

      <IdentificationFields
        value={identification}
        onChange={updateIdentification}
        errors={identificationErrors}
        disabled={isLoading}
      />

      <FormRow>
        <Input
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          rightIcon={showPassword ? <EyeOff /> : <Eye />}
          rightIconLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onRightIconClick={() => setShowPassword((value) => !value)}
        />
        <Input
          label="Confirmar"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isLoading}
          rightIcon={showConfirmPassword ? <EyeOff /> : <Eye />}
          rightIconLabel={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onRightIconClick={() => setShowConfirmPassword((value) => !value)}
        />
      </FormRow>

      <Checkbox
        label="Acepto el tratamiento de mis datos y los términos de uso de la plataforma."
        checked={acceptsTerms}
        onChange={(event) => setAcceptsTerms(event.target.checked)}
        disabled={isLoading}
      />

      {error ? <FormError>{error}</FormError> : null}

      <Button type="submit" size={size ?? "lg"} fullWidth disabled={isLoading}>
        {isLoading ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className={styles.foot}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login">
          <b>Inicia sesión</b>
        </Link>
      </p>
    </form>
  );
}
