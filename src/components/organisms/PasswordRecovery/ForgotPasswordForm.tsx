"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useForgotPassword } from "@/modules/auth/hooks/usePasswordRecovery/usePasswordRecovery";
import { Button, FormError, Input } from "../../atoms";
import styles from "./PasswordRecovery.module.css";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Paso 1: la persona escribe su correo y recibe el enlace en el principal y el alterno. */
export function ForgotPasswordForm() {
  const { request, status, message, error } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setLocalError("Escribe el correo con el que te registraste.");
      return;
    }
    setLocalError("");
    void request(email.trim());
  };

  if (status === "done") {
    return (
      <div className={styles.result} role="status">
        <span className={styles.resultIcon} aria-hidden>
          <MailCheck size={22} />
        </span>
        <p className={styles.resultText}>{message}</p>
        <p className={styles.resultHint}>El enlace vence en 30 minutos y sirve una sola vez.</p>
        <Link href="/login" className={styles.back}>
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Correo"
        type="email"
        placeholder="usuario@ejemplo.com"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={status === "sending"}
      />
      {localError || error ? <FormError>{localError || error}</FormError> : null}
      <Button type="submit" size="lg" fullWidth disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviarme el enlace"}
      </Button>
      <Link href="/login" className={styles.back}>
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
