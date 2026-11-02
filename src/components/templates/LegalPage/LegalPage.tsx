import type { LegalDocument } from "@/modules/legal/legal-texts";
import { ArrowLink, Card, Logo } from "../../atoms";
import styles from "./LegalPage.module.css";

type LegalPageProps = {
  document: LegalDocument;
};

/** Página pública con un texto legal en lenguaje sencillo (v2.2, E2). No exige sesión. */
export function LegalPage({ document }: LegalPageProps) {
  return (
    <main className={styles.wrap}>
      <Card className={styles.card} padding={36}>
        <Logo mark="red" size={36} />
        <h1 className={styles.title}>{document.title}</h1>
        <p className={styles.intro}>{document.intro}</p>
        {document.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.heading}>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <div className={styles.actions}>
          <ArrowLink href="/registro">Ir al registro</ArrowLink>
          <ArrowLink href="/login">Iniciar sesión</ArrowLink>
        </div>
      </Card>
    </main>
  );
}
