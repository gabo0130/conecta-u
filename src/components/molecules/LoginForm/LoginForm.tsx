"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getErrorMessage } from "@/utils/get-error-message";
import { Button, Input } from "../../atoms";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        getErrorMessage(err, "Error al iniciar sesión. Intenta nuevamente."),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputs}>
        <Input
          label="Correo"
          type="email"
          placeholder="usuario@ejemplo.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Ingresa tu contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
        />
      </div>

      {error ? <div className={styles.formError}>{error}</div> : null}

      <Button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? "Ingresando..." : "Ingresar al sistema"}
      </Button>

      <p className={styles.footerText}>
        Al continuar aceptas las políticas de acceso del sistema.
      </p>
    </form>
  );
}