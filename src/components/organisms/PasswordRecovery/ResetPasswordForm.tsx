"use client";

import Link from "next/link";
import { Check, CircleAlert, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useResetPassword } from "@/modules/auth/hooks/usePasswordRecovery/usePasswordRecovery";
import { isValidPassword, passwordRules, readResetToken } from "@/modules/auth/utils/password-rules";
import { Button, FormError, Input, Spinner } from "../../atoms";
import styles from "./PasswordRecovery.module.css";

type Stage = "checking" | "invalid" | "form" | "done";

/** Paso 2: con el enlace del correo, crea la contraseña nueva. */
export function ResetPasswordForm() {
  const { check, reset, isSaving, error } = useResetPassword();
  const [stage, setStage] = useState<Stage>("checking");
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState("");

  // El token se lee una sola vez (en modo estricto React corre el efecto dos veces).
  const read = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (read.current === undefined) {
      read.current = readResetToken(window.location.hash);
      // El token no se deja en la barra de direcciones ni en el historial.
      window.history.replaceState(null, "", window.location.pathname);
    }
    const found = read.current;
    void (found ? check(found) : Promise.resolve(false)).then((valid) => {
      setToken(found);
      setStage(valid ? "form" : "invalid");
    });
  }, [check]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidPassword(password)) {
      setLocalError("La contraseña todavía no cumple las condiciones.");
      return;
    }
    if (password !== confirmation) {
      setLocalError("Las contraseñas no coinciden.");
      return;
    }
    setLocalError("");
    if (token && (await reset(token, password))) setStage("done");
  };

  if (stage === "checking") {
    return (
      <div className={styles.result}>
        <Spinner label="Revisando el enlace" />
      </div>
    );
  }

  if (stage === "invalid") {
    return (
      <div className={styles.result} role="alert">
        <span className={[styles.resultIcon, styles.resultIconWarn].join(" ")} aria-hidden>
          <CircleAlert size={22} />
        </span>
        <p className={styles.resultText}>El enlace venció, ya se usó o no está completo.</p>
        <p className={styles.resultHint}>Pide uno nuevo: llega al correo principal y al alterno.</p>
        <Link href="/recuperar-contrasena" className={styles.back}>
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className={styles.result} role="status">
        <span className={styles.resultIcon} aria-hidden>
          <ShieldCheck size={22} />
        </span>
        <p className={styles.resultText}>Tu contraseña se actualizó.</p>
        <p className={styles.resultHint}>Cerramos las sesiones abiertas en otros dispositivos por seguridad.</p>
        <Link href="/login" className={styles.back}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const rules = passwordRules(password);
  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
      <Input
        label="Contraseña nueva"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isSaving}
        rightIcon={show ? <EyeOff /> : <Eye />}
        rightIconLabel={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        onRightIconClick={() => setShow((value) => !value)}
      />
      <ul className={styles.rules} aria-label="Condiciones de la contraseña">
        {rules.map((rule) => (
          <li key={rule.id} className={rule.ok ? styles.ruleOk : styles.rule}>
            <Check size={14} aria-hidden /> {rule.label}
            <span className={styles.srOnly}>{rule.ok ? " (cumple)" : " (falta)"}</span>
          </li>
        ))}
      </ul>
      <Input
        label="Repite la contraseña"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        disabled={isSaving}
      />
      {localError || error ? <FormError>{localError || error}</FormError> : null}
      <Button type="submit" size="lg" fullWidth disabled={isSaving}>
        {isSaving ? "Guardando…" : "Guardar contraseña nueva"}
      </Button>
    </form>
  );
}
