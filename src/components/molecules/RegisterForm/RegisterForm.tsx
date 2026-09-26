"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCreateUser } from "@/modules/auth/hooks/useCreateUser/useCreateUser";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import type { PersonType, RegisterRole } from "@/apis/interfaces/auth";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Button, Checkbox, FormError, FormRow, Input, Select } from "../../atoms";
import type { ControlSize } from "../../atoms";
import styles from "./RegisterForm.module.css";

const ROLE_OPTIONS = [
  { value: "LIDER", label: "Líder de proyecto" },
  { value: "COLABORADOR", label: "Colaborador" },
];

const PERSON_TYPE_OPTIONS = [
  { value: "ESTUDIANTE", label: "Estudiante" },
  { value: "DOCENTE", label: "Docente" },
];

type RegisterFormProps = {
  /** Tamaño de todos los campos y botones del formulario. */
  size?: ControlSize;
};

export function RegisterForm({ size }: RegisterFormProps) {
  const router = useRouter();
  const { createUser, isLoading } = useCreateUser();
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();

  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(ROLE_OPTIONS[1].value);
  const [personType, setPersonType] = useState<string>(PERSON_TYPE_OPTIONS[0].value);
  const [programId, setProgramId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [error, setError] = useState("");

  const isCollaborator = role === "COLABORADOR";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }
    if (isCollaborator) {
      if (firstName.trim().length < 2 || lastName.trim().length < 2) {
        setError("Nombres y apellidos deben tener al menos 2 caracteres");
        return;
      }
      if (!programId) {
        setError("Selecciona tu programa académico");
        return;
      }
    } else if (fullName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!acceptsTerms) {
      setError("Debes aceptar los términos de uso");
      return;
    }

    try {
      await createUser({
        fullName: isCollaborator ? `${firstName.trim()} ${lastName.trim()}`.trim() : fullName.trim(),
        email,
        password,
        role: role as RegisterRole,
        collaborator: isCollaborator
          ? {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              personType: personType as PersonType,
              programId,
            }
          : undefined,
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
    <form onSubmit={handleSubmit} className={styles.form} data-size={size}>
      {isCollaborator ? (
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
      ) : (
        <Input
          label="Nombre completo"
          placeholder="Tu nombre completo"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={isLoading}
        />
      )}
      <Input
        label="Correo institucional"
        type="email"
        placeholder="nombre@ufps.edu.co"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isLoading}
      />

      {/* Para un líder el rol va solo y ocupa todo el ancho, igual que los demás campos. */}
      <FormRow columns={isCollaborator ? 2 : 1}>
        <Select
          label="Rol"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={isLoading}
        />
        {isCollaborator ? (
          <Select
            label="Tipo de persona"
            options={PERSON_TYPE_OPTIONS}
            value={personType}
            onChange={(event) => setPersonType(event.target.value)}
            disabled={isLoading}
          />
        ) : null}
      </FormRow>

      {isCollaborator ? (
        <Select
          label="Programa"
          options={[
            { value: "", label: isLoadingPrograms ? "Cargando programas..." : "Selecciona un programa" },
            ...programs.map((program) => ({ value: program.id, label: program.name })),
          ]}
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
          disabled={isLoading || isLoadingPrograms}
        />
      ) : null}

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
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
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
