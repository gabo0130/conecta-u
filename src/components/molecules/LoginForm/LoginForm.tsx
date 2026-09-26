"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Button, FormError, Input } from "../../atoms";
import type { ControlSize } from "../../atoms";
import styles from "./LoginForm.module.css";

type LoginFormProps = {
  /** Tamaño de todos los campos y botones del formulario. */
  size?: ControlSize;
};

export function LoginForm({ size }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      void notify.error(getErrorMessage(err, "No se pudo iniciar sesión. Intenta nuevamente."), {
        title: "No pudimos iniciar tu sesión",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} data-size={size}>
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
          type={showPassword ? "text" : "password"}
          placeholder="Ingresa tu contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          rightIcon={showPassword ? <EyeOff /> : <Eye />}
          rightIconLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onRightIconClick={() => setShowPassword((value) => !value)}
        />
      </div>

      {error ? <FormError>{error}</FormError> : null}

      <Button type="submit" size={size ?? "lg"} fullWidth disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Ingresar al sistema"}
      </Button>

      <p className={styles.footerText}>
        Al continuar aceptas las políticas de acceso del sistema.
      </p>
    </form>
  );
}