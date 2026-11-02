import { AuthLayout } from "@/components/templates";
import { ResetPasswordForm } from "@/components/organisms";
import styles from "../login/login.module.css";

export default function Page() {
  return (
    <AuthLayout
      title="Donde las ideas encuentran a las personas capaces de hacerlas realidad."
      subtitle="El enlace llega a tu correo principal y, si lo registraste, también al alterno. Sirve una sola vez y vence en 30 minutos."
    >
      <h2 className={styles.h2}>Crea una contraseña nueva</h2>
      <p className={styles.sub}>Elige una contraseña que no uses en otros sitios.</p>
      <div className={styles.formWrap}>
        <ResetPasswordForm />
      </div>
    </AuthLayout>
  );
}
