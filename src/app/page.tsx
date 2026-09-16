import { LoginForm } from "../components/molecules";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.loginSection}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <span className={styles.loginTag}>
              Iniciar sesión
            </span>
            <h2 className={styles.loginTitle}>
              Bienvenido
            </h2>
            <p className={styles.loginDescription}>
              Usa tus credenciales para entrar al sistema de forma segura.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>

      <section className={styles.brandSection}>
        <div className={styles.brandGlow} />

        <div className={styles.brandTop}>
          <div className={styles.brandBadge}>
            <div>
              <strong className={styles.brandStrong}>
                Conecta U
              </strong>
            </div>
          </div>

          <div className={styles.brandContent}>
            <span className={styles.brandWelcome}>
              Bienvenido
            </span>
            <h1 className={styles.brandTitle}>
              Conecta con tu comunidad universitaria.
            </h1>
            <p className={styles.brandDescription}>
              Conecta U es la plataforma que une a estudiantes y a la comunidad académica en un solo lugar.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerRule} />
          <p className={styles.footerText}>
            Desarrollado por tu equipo.
          </p>
        </div>
      </section>

    </main>
  );
}
