"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, Card, Logo } from "../../atoms";
import styles from "./NotFound.module.css";

export function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} padding={40}>
        <div className={styles.logo}>
          <Logo mark="red" size={44} />
        </div>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.subtitle}>
          La página que buscas no existe o fue movida. Verifica la dirección o vuelve a la página anterior.
        </p>
        <div className={styles.actions}>
          <Button leftIcon={<ArrowLeft size={17} />} onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </Card>
    </div>
  );
}
