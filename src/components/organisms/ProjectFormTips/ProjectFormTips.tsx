import { Check } from "lucide-react";
import { Card } from "../../atoms";
import styles from "./ProjectFormTips.module.css";

const TIPS = [
  "Sé específico en los objetivos.",
  "Incluye las habilidades técnicas y blandas que ya conoces.",
  "Define al menos un entregable con su alcance.",
  "Menciona si es interdisciplinario.",
];

/** Consejos para llenar el formulario de proyecto (columna lateral de crear y editar). */
export function ProjectFormTips() {
  return (
    <Card padding={20}>
      <h2 className={styles.title}>Consejos</h2>
      <ul className={styles.tips}>
        {TIPS.map((tip) => (
          <li key={tip} className={styles.tip}>
            <Check size={17} className={styles.icon} aria-hidden />
            {tip}
          </li>
        ))}
      </ul>
    </Card>
  );
}
