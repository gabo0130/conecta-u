"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCreateUser } from "@/modules/auth/hooks/useCreateUser/useCreateUser";
import type { ProjectRole } from "@/apis/interfaces/auth";
import { Button, Input, Select } from "../../atoms";
import styles from "./RegisterForm.module.css";

const ROLE_OPTIONS = [
  { value: "LIDER", label: "Líder de proyecto" },
  { value: "COLABORADOR", label: "Colaborador" },
];

const PROGRAM_OPTIONS = [
  { value: "sistemas", label: "Ing. de Sistemas" },
  { value: "electronica", label: "Ing. Electrónica" },
  { value: "industrial", label: "Ing. Industrial" },
  { value: "civil", label: "Ing. Civil" },
];

export function RegisterForm() {
  const router = useRouter();
  const { createUser, isLoading } = useCreateUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(ROLE_OPTIONS[1].value);
  const [program, setProgram] = useState(PROGRAM_OPTIONS[0].value);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
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
      await createUser({ name, email, password, role: role as ProjectRole, program });
      router.push("/login");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear la cuenta. Intenta nuevamente.";
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Nombre completo"
        placeholder="Tu nombre completo"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={isLoading}
      />
      <Input
        label="Correo institucional"
        type="email"
        placeholder="nombre@ufps.edu.co"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isLoading}
      />

      <div className={styles.row}>
        <Select
          label="Rol"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={isLoading}
        />
        <Select
          label="Programa"
          options={PROGRAM_OPTIONS}
          value={program}
          onChange={(event) => setProgram(event.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
        />
        <Input
          label="Confirmar"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isLoading}
        />
      </div>

      <label className={styles.terms}>
        <input
          type="checkbox"
          checked={acceptsTerms}
          onChange={(event) => setAcceptsTerms(event.target.checked)}
          className={styles.checkbox}
          disabled={isLoading}
        />
        Acepto el tratamiento de mis datos y los términos de uso de la plataforma.
      </label>

      {error ? <div className={styles.formError}>{error}</div> : null}

      <Button type="submit" className={styles.submit} disabled={isLoading}>
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
