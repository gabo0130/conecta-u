"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import type { ReportFormat, ReportKind } from "@/apis/interfaces/admin";
import { useReports } from "@/modules/admin/hooks/useReports/useReports";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { Button, Card, Spinner } from "../../atoms";
import styles from "./ReportsCard.module.css";

const REPORTS: { kind: ReportKind; title: string; description: string }[] = [
  { kind: "proyectos", title: "Proyectos", description: "Tipo, categoría, estado, líder, entidades, perfiles y convocatorias." },
  { kind: "personas", title: "Personas", description: "Perfil, disponibilidad, habilidades, certificados pendientes y autorizaciones." },
  { kind: "habilidades", title: "Oferta y demanda de habilidades", description: "Cuántas personas ofrecen y cuántos perfiles piden cada habilidad." },
  { kind: "recomendaciones", title: "Recomendaciones", description: "Ranking por perfil con el porcentaje de correspondencia y sus componentes." },
  { kind: "convocatorias", title: "Convocatorias", description: "Historial de envíos por proyecto con su estado." },
];

/** RF16 (HU-14): reportes consolidados del ADMIN en Excel o CSV. */
export function ReportsCard() {
  const { download, downloading } = useReports();

  const handleDownload = async (kind: ReportKind, format: ReportFormat, title: string) => {
    try {
      await download(kind, format);
    } catch (err) {
      void notify.error(getErrorMessage(err, `No se pudo generar el reporte de ${title.toLowerCase()}.`));
    }
  };

  return (
    <Card padding={20}>
      <h3 className={styles.title}>Reportes</h3>
      <p className={styles.subtitle}>Descarga la información consolidada de la plataforma.</p>
      <ul className={styles.list}>
        {REPORTS.map((report) => (
          <li key={report.kind} className={styles.item}>
            <span className={styles.icon} aria-hidden>
              <FileSpreadsheet size={20} />
            </span>
            <div className={styles.text}>
              <span className={styles.name}>{report.title}</span>
              <span className={styles.description}>{report.description}</span>
            </div>
            <div className={styles.actions}>
              <Button
                size="sm"
                leftIcon={
                  downloading === `${report.kind}.xlsx` ? <Spinner size="sm" label="Generando reporte" /> : <Download size={16} />
                }
                disabled={downloading !== null}
                onClick={() => void handleDownload(report.kind, "xlsx", report.title)}
                aria-label={`Descargar ${report.title} en Excel`}
              >
                Excel
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={downloading === `${report.kind}.csv` ? <Spinner size="sm" label="Generando reporte" /> : undefined}
                disabled={downloading !== null}
                onClick={() => void handleDownload(report.kind, "csv", report.title)}
                aria-label={`Descargar ${report.title} en CSV`}
              >
                CSV
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
