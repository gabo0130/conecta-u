import { AuthLayout } from "@/components/templates";
import { ForgotPasswordForm } from "@/components/organisms";
import styles from "../login/login.module.css";

export default function Page() {
  return (
    <AuthLayout
      title="Donde las ideas encuentran a las personas capaces de hacerlas realidad."
      subtitle="El enlace llega a tu correo principal y, si lo registraste, también al alterno. Sirve una sola vez y vence en 30 minutos."
    >
      <h2 className={styles.h2}>Recupera tu acceso</h2>
      <p className={styles.sub}>Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.</p>
      <div className={styles.formWrap}>
        <ForgotPasswordForm />
      </div>
    </AuthLayout>
  );
}
