import { AuthLayout } from "@/components/templates";
import { RegisterForm } from "@/components/molecules";
import styles from "./registro.module.css";

export default function RegistroPage() {
  return (
    <AuthLayout
      title="Únete a la comunidad que conecta el talento de la UFPS."
      subtitle="Crea tu cuenta como líder de proyecto o colaborador y empieza a formar equipos interdisciplinarios."
      footer="Universidad Francisco de Paula Santander"
    >
      <h2 className={styles.h2}>Crea tu cuenta</h2>
      <p className={styles.sub}>Completa tus datos para empezar.</p>

      <div className={styles.formWrap}>
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
