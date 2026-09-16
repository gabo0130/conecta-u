"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button, Input } from "../../atoms";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      await login(email, password);
      // El login fue exitoso, redirigir al dashboard
      console.log("Login successful, redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err: any) {
      // Mostrar error del servidor
      const errorMessage =
        err.message || "Error al iniciar sesión. Intenta nuevamente.";
      setError(errorMessage);
      console.error("Login error:", err);
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

      {error && (
        <div
          style={{
            color: "#dc2626",
            fontSize: "0.875rem",
            marginBottom: "1rem",
            padding: "0.75rem",
            backgroundColor: "#fee2e2",
            borderRadius: "0.375rem",
            border: "1px solid #fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <div className={styles.row}>
        <label className={styles.remember}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className={styles.checkbox}
            disabled={isLoading}
          />
          Recordarme
        </label>

        <Link href="#" className={styles.forgotLink}>
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

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