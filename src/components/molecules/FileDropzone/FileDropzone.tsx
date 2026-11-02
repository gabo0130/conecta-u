"use client";

import { ChangeEvent, DragEvent, useId, useRef, useState } from "react";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { IconButton } from "../../atoms";
import styles from "./FileDropzone.module.css";

type FileDropzoneProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  /** Extensiones aceptadas, p. ej. [".xlsx"]. */
  accept: string[];
  maxSizeBytes: number;
  disabled?: boolean;
  hint?: string;
  /** Validación extra del contenido (p. ej. la firma del archivo); devuelve el error o `null`. */
  validate?: (file: File) => Promise<string | null>;
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Zona para arrastrar o elegir un archivo; valida extensión, tamaño y (opcional) contenido antes de aceptarlo. */
export function FileDropzone({ file, onChange, accept, maxSizeBytes, disabled = false, hint, validate }: FileDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  // Si se elige otro archivo mientras se valida el anterior, solo cuenta el último.
  const latest = useRef<File | null>(null);

  const pick = async (candidate: File | undefined) => {
    if (!candidate) return;
    const name = candidate.name.toLowerCase();
    if (!accept.some((extension) => name.endsWith(extension))) {
      setError(`El archivo debe ser ${accept.join(" o ")}.`);
      return;
    }
    if (candidate.size > maxSizeBytes) {
      setError(`El archivo supera el máximo de ${formatSize(maxSizeBytes)}.`);
      return;
    }
    latest.current = candidate;
    let invalid: string | null = null;
    try {
      invalid = validate ? await validate(candidate) : null;
    } catch {
      invalid = "No se pudo leer el archivo. Intenta elegirlo de nuevo.";
    }
    if (latest.current !== candidate) return;
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    onChange(candidate);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) void pick(event.dataTransfer.files[0]);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    void pick(event.target.files?.[0]);
    // Permite volver a elegir el mismo archivo después de quitarlo.
    event.target.value = "";
  };

  if (file) {
    return (
      <div className={styles.selected}>
        <span className={styles.fileIcon} aria-hidden>
          <FileSpreadsheet size={22} />
        </span>
        <div className={styles.fileText}>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatSize(file.size)}</span>
        </div>
        <IconButton
          variant="plain"
          size="sm"
          label="Quitar archivo"
          icon={<X />}
          onClick={() => onChange(null)}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <label
        htmlFor={inputId}
        className={[styles.zone, isDragging ? styles.dragging : "", disabled ? styles.disabled : ""]
          .filter(Boolean)
          .join(" ")}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className={styles.zoneIcon} aria-hidden>
          <UploadCloud size={26} />
        </span>
        <span className={styles.zoneTitle}>
          Arrastra el archivo aquí o <span className={styles.link}>elígelo desde tu equipo</span>
        </span>
        {hint ? <span className={styles.zoneHint}>{hint}</span> : null}
        {/* Input nativo oculto: es el único control de archivo de la app y lo encapsula esta molécula. */}
        <input
          id={inputId}
          type="file"
          accept={accept.join(",")}
          className={styles.input}
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
