"use client";

import { ButtonHTMLAttributes, KeyboardEvent, ReactNode, useId, useState } from "react";
import Link from "next/link";
import type { ControlSize } from "../types";
import styles from "./IconButton.module.css";

type IconButtonVariant = "ghost" | "plain";

type CommonProps = {
  /** Obligatorio: es el único texto que lee un lector de pantalla. */
  label: string;
  icon: ReactNode;
  /** ghost: con borde (junto a un campo); plain: sin borde (acciones dentro de una tarjeta o tabla). */
  variant?: IconButtonVariant;
  size?: ControlSize;
  /** Color del ícono y del cuadro de fondo al pasar el mouse: rojo de marca, verde (aprobar) o peligro (eliminar). */
  tone?: "default" | "success" | "danger";
  /**
   * Etiqueta visible al pasar el mouse o enfocar con teclado (reemplaza el `title` nativo, que tarda
   * y no aparece con el foco). Se anuncia como descripción del control y se cierra con Escape.
   */
  tooltip?: string;
  /** `end`: la etiqueta se alinea al borde derecho del botón (columnas de acciones al final de una fila). */
  tooltipAlign?: "center" | "end";
  className?: string;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "children" | "className"> & { href?: undefined };

/** Si la acción navega (ver detalle), es un enlace con el mismo aspecto; no acepta props de botón. */
type LinkProps = CommonProps & { href: string };

type IconButtonProps = ButtonProps | LinkProps;

const TONE_CLASS = { default: "", success: styles.success, danger: styles.danger };

/** Botón (o enlace) cuadrado de solo ícono; mide lo mismo que un campo del mismo tamaño. */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size,
  tone = "default",
  tooltip,
  tooltipAlign = "center",
  className,
  ...rest
}: IconButtonProps) {
  const tooltipId = useId();
  const [dismissed, setDismissed] = useState(false);

  const controlClassName = [styles.button, styles[variant], TONE_CLASS[tone], tooltip ? "" : className]
    .filter(Boolean)
    .join(" ");
  // Sin etiqueta visible, el `title` nativo hace de ayuda al pasar el mouse.
  const shared = {
    "data-size": size,
    "aria-label": label,
    "aria-describedby": tooltip ? tooltipId : undefined,
    title: tooltip ? undefined : label,
    className: controlClassName,
  };

  let control: ReactNode;
  if (rest.href !== undefined) {
    control = (
      <Link href={rest.href} {...shared}>
        {icon}
      </Link>
    );
  } else {
    const { type = "button", ...buttonProps } = rest;
    control = (
      <button {...buttonProps} type={type} {...shared}>
        {icon}
      </button>
    );
  }

  if (!tooltip) return control;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !dismissed) {
      // Cierra solo la etiqueta (WCAG 1.4.13); no debe cerrar un modal que esté abierto debajo.
      event.stopPropagation();
      setDismissed(true);
    }
  };

  const wrapClassName = [
    styles.tooltipWrap,
    tooltipAlign === "end" && styles.alignEnd,
    dismissed && styles.dismissed,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={wrapClassName}
      onKeyDown={handleKeyDown}
      onBlur={() => setDismissed(false)}
      onMouseLeave={() => setDismissed(false)}
    >
      {control}
      <span id={tooltipId} role="tooltip" className={styles.tooltip}>
        {tooltip}
      </span>
    </span>
  );
}
