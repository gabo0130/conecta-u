import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./ArrowLink.module.css";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Enlace de texto con flecha para una acción única de navegación ("Ver todos", "Ver perfil técnico"). */
export function ArrowLink({ href, children, className }: ArrowLinkProps) {
  return (
    <Link href={href} className={[styles.link, className].filter(Boolean).join(" ")}>
      <span>{children}</span>
      <ArrowRight size={15} aria-hidden />
    </Link>
  );
}
