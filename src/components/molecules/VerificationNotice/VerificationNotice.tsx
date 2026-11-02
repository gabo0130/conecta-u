import { ShieldAlert } from "lucide-react";
import { VERIFICATION_NOTICE } from "@/modules/recommendations/utils/recommendation-view";
import styles from "./VerificationNotice.module.css";

/** Aviso fijo de las recomendaciones (v2.2, E4): siempre visible, nunca en un tooltip. */
export function VerificationNotice() {
  return (
    <div className={styles.notice} role="note">
      <ShieldAlert size={18} aria-hidden />
      <p>{VERIFICATION_NOTICE}</p>
    </div>
  );
}
