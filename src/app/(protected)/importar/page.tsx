"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, History, Upload } from "lucide-react";
import type { ImportCollaboratorsResult } from "@/apis/interfaces/admin";
import { AppShell, PageGrid } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { FileDropzone } from "@/components/molecules";
import { ImportResultTable, RoleGuard } from "@/components/organisms";
import { useCollaboratorImport } from "@/modules/admin/hooks/useCollaboratorImport/useCollaboratorImport";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "./importar.module.css";

// Mismo límite que valida el backend (MAX_IMPORT_FILE_SIZE_MB).
const MAX_FILE_BYTES = 5 * 1024 * 1024;

// Mismos valores que la hoja "Guía" de la plantilla y que valida el backend
// (import-collaborators.constants.ts) — si cambian allá, cambian aquí también.
const SHEETS = [
  {
    name: "Colaboradores",
    fields:
      'correo, nombres, apellidos, tipo_persona (Estudiante, Docente), programa (nombre exacto del catálogo), disponibilidad (Disponible, Parcial, No disponible), horas_semana y autoriza_datos ("Sí").',
  },
  {
    name: "Habilidades",
    fields:
      "correo, habilidad (nombre o sinónimo del catálogo), tipo (Conocimiento, Competencia, Habilidad blanda), nivel (Básico, Intermedio, Avanzado, Experto) y meses_experiencia.",
  },
  {
    name: "Experiencia",
    fields:
      "correo, tipo (Laboral, Práctica, Proyecto académico, Semillero de investigación, Proyecto personal, Voluntariado, Docencia), rol, organización, fecha_inicio (AAAA-MM-DD), actual (Sí/No), horas_semana y nivel.",
  },
];

function ImportGuide() {
  return (
    <Card padding={20}>
      <h2 className={styles.guideTitle}>Cómo llenar la plantilla</h2>
      <p className={styles.guideText}>
        La columna <b>correo</b> une las tres hojas. Los desplegables de las columnas de la plantilla ya solo dejan
        elegir un valor válido; estos son los campos obligatorios de cada hoja:
      </p>
      <dl className={styles.sheets}>
        {SHEETS.map((sheet) => (
          <div key={sheet.name}>
            <dt>{sheet.name}</dt>
            <dd>{sheet.fields}</dd>
          </div>
        ))}
      </dl>
      <ul className={styles.notes}>
        <li>Escribe exactamente esos valores (con mayúscula inicial); el desplegable te evita errores de tipeo.</li>
        <li>Una habilidad que no está en el catálogo se crea como pendiente de revisión.</li>
        <li>Las filas con errores se rechazan una a una; las válidas se guardan igual.</li>
        <li>Usa solo datos ficticios en las pruebas.</li>
      </ul>
      <Link href="/importar/historial" className={styles.historyLink}>
        <History size={16} /> Ver historial de importaciones
      </Link>
    </Card>
  );
}

function CollaboratorImport() {
  const router = useRouter();
  const { downloadTemplate, importFile, isDownloading, isImporting } = useCollaboratorImport();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ data: ImportCollaboratorsResult; fileName: string } | null>(null);

  const handleDownload = async () => {
    try {
      await downloadTemplate();
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo descargar la plantilla."));
    }
  };

  const handleImport = async () => {
    if (!file) return;
    const accepted = await notify.confirm({
      title: "¿Importar colaboradores?",
      message: `Se guardarán los colaboradores válidos de "${file.name}". Las filas con errores se rechazarán y verás la causa de cada una.`,
      confirmLabel: "Importar",
    });
    if (!accepted) return;

    try {
      const data = await loading.run(importFile(file), "Importando colaboradores… esto puede tardar un momento.");
      setResult({ data, fileName: file.name });
      setFile(null);
      if (data.rejected.length === 0) {
        void notify.success(`Se crearon ${data.created} colaboradores sin filas rechazadas.`, {
          title: "Importación completa",
        });
      } else {
        void notify.warning(
          `Se crearon ${data.created} colaboradores y se rechazaron ${data.rejected.length} filas. Revisa la causa de cada una en la tabla.`,
          { title: "Importación con filas rechazadas" },
        );
      }
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo importar el archivo."), { title: "No se pudo importar" });
    }
  };

  return (
    <PageGrid
      aside={<ImportGuide />}
      header={
        <>
          <h1 className={styles.h1}>Importar colaboradores</h1>
          <p className={styles.subtitle}>
            Carga perfiles técnicos desde la plantilla de Excel. Las personas importadas no necesitan usuario para
            entrar en las recomendaciones.
          </p>
        </>
      }
    >
      <div className={styles.steps}>
        <Card padding={20}>
          <div className={styles.step}>
            <span className={styles.stepNumber} aria-hidden>
              1
            </span>
            <div className={styles.stepBody}>
              <h2 className={styles.stepTitle}>Descarga la plantilla</h2>
              <p className={styles.stepText}>Tiene las hojas Colaboradores, Habilidades y Experiencia con sus encabezados.</p>
              <Button variant="ghost" leftIcon={<Download />} onClick={() => void handleDownload()} disabled={isDownloading}>
                {isDownloading ? "Descargando…" : "Descargar plantilla .xlsx"}
              </Button>
            </div>
          </div>
        </Card>

        <Card padding={20}>
          <div className={styles.step}>
            <span className={styles.stepNumber} aria-hidden>
              2
            </span>
            <div className={styles.stepBody}>
              <h2 className={styles.stepTitle}>Sube el archivo diligenciado</h2>
              <FileDropzone
                file={file}
                onChange={setFile}
                accept={[".xlsx"]}
                maxSizeBytes={MAX_FILE_BYTES}
                disabled={isImporting}
                hint="Solo .xlsx, máximo 5 MB."
              />
              <div className={styles.stepActions}>
                <Button leftIcon={<Upload />} onClick={() => void handleImport()} disabled={!file || isImporting}>
                  {isImporting ? "Importando…" : "Importar colaboradores"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {result ? (
          <>
            <ImportResultTable result={result.data} fileName={result.fileName} />
            <div className={styles.stepActions}>
              <Button variant="ghost" leftIcon={<History />} onClick={() => router.push(`/importar/historial/${result.data.id}`)}>
                Ver en el historial
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </PageGrid>
  );
}

export default function ImportarPage() {
  return (
    <AppShell>
      <RoleGuard roles={["ADMIN"]}>
        <CollaboratorImport />
      </RoleGuard>
    </AppShell>
  );
}
