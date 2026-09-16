import { ReactNode } from "react";
import { Check } from "lucide-react";
import { Logo } from "../../atoms";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, bullets = [], footer, children }: AuthLayoutProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div className={styles.pattern} />
        <div className={styles.panelTop}>
          <Logo mark="red" size={44} />
        </div>
        <div className={styles.panelBody}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.bullets}>
          {bullets.map((bullet) => (
            <div key={bullet} className={styles.bullet}>
              <span className={styles.bulletIcon}>
                <Check size={15} />
              </span>
              {bullet}
            </div>
          ))}
          {footer ? <div className={styles.panelFooter}>{footer}</div> : null}
        </div>
      </div>
      <div className={styles.formSide}>
        <div className={styles.form}>{children}</div>
      </div>
    </div>
  );
}
