"use client";

import { Eye, FileCheck2, Trash2 } from "lucide-react";
import type { ExperienceCertificate } from "@/apis/interfaces/collaborator";
import { IconButton } from "../../atoms";
import { FileDropzone } from "../FileDropzone/FileDropzone";
import styles from "./CertificateField.module.css";

type CertificateFieldProps = {
  /** Certificado ya guardado (si existe). */
  current: ExperienceCertificate | null;
  /** Archivo elegido para subir (reemplaza al actual al guardar). */
  file: File | null;
  onFileChange: (file: File | null) => void;
  required: boolean;
  accept: string[];
  maxSizeBytes: number;
  hint: string;
  onView?: () => void;
  /** Solo en certificados opcionales: el obligatorio se reemplaza, no se quita. */
  onRemove?: () => void;
  validate?: (file: File) => Promise<string | null>;
  disabled?: boolean;
};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

/** RF4 (v2.2, E8): certificado que soporta una experiencia; muestra el guardado o permite elegir uno. */
export function CertificateField({
  current,
  file,
  onFileChange,
  required,
  accept,
  maxSizeBytes,
  hint,
  onView,
  onRemove,
  validate,
  disabled = false,
}: CertificateFieldProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        Certificado {required ? <span className={styles.required}>(obligatorio)</span> : <span className={styles.optional}>(opcional)</span>}
      </span>
      {current && !file ? (
        <div className={styles.current}>
          <span className={styles.icon} aria-hidden>
            <FileCheck2 size={20} />
          </span>
          <div className={styles.text}>
            <span className={styles.name}>{current.fileName}</span>
            <span className={styles.meta}>
              {formatSize(current.sizeBytes)} · subido el {formatDate(current.uploadedAt)}
            </span>
          </div>
          {onView ? (
            <IconButton variant="plain" size="sm" label={`Ver ${current.fileName}`} tooltip="Ver" icon={<Eye />} onClick={onView} />
          ) : null}
          {onRemove ? (
            <IconButton
              variant="plain"
              size="sm"
              tone="danger"
              label={`Quitar ${current.fileName}`}
              tooltip="Quitar"
              tooltipAlign="end"
              icon={<Trash2 />}
              onClick={onRemove}
              disabled={disabled}
            />
          ) : null}
        </div>
      ) : null}
      <FileDropzone
        file={file}
        onChange={onFileChange}
        accept={accept}
        maxSizeBytes={maxSizeBytes}
        disabled={disabled}
        validate={validate}
        hint={current ? `Para reemplazarlo, elige otro archivo. ${hint}` : hint}
      />
    </div>
  );
}
