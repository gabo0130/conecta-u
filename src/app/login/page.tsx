import Link from "next/link";
import { AuthLayout } from "@/components/templates";
import { LoginForm } from "@/components/molecules";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Donde las ideas encuentran a las personas capaces de hacerlas realidad."
      subtitle="Registra una necesidad o un proyecto de investigación y deja que la plataforma identifique los perfiles requeridos y te recomiende colaboradores en la UFPS."
      bullets={[
        "Análisis de proyectos con inteligencia artificial",
        "Recomendación de colaboradores por afinidad de perfil",
        "Equipos interdisciplinarios para semilleros e investigación",
      ]}
    >
      <h2 className={styles.h2}>Bienvenido de nuevo</h2>
      <p className={styles.sub}>Ingresa a tu cuenta para continuar.</p>

      <div className={styles.formWrap}>
        <LoginForm />
        <p className={styles.foot}>
          ¿No tienes cuenta?{" "}
          <Link href="/registro">
            <b>Regístrate</b>
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
