import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ImportCollaboratorsResult } from "@/apis/interfaces/admin";
import { Card } from "../../atoms";
import styles from "./ImportResultTable.module.css";

type ImportResultTableProps = {
  result: ImportCollaboratorsResult;
  fileName?: string;
};

/** Resultado de una importación de colaboradores: creados, filas rechazadas (hoja, fila, causa) y advertencias. */
export function ImportResultTable({ result, fileName }: ImportResultTableProps) {
  const summary = [
    { key: "created", label: "Colaboradores creados", value: result.created, icon: CheckCircle2, tone: styles.ok },
    { key: "rejected", label: "Filas rechazadas", value: result.rejected.length, icon: XCircle, tone: styles.bad },
    { key: "warnings", label: "Advertencias", value: result.warnings.length, icon: AlertTriangle, tone: styles.warn },
  ];

  return (
    <div className={styles.result}>
      <div className={styles.summary}>
        {summary.map(({ key, label, value, icon: Icon, tone }) => (
          <Card key={key} padding={18} className={styles.tile}>
            <span className={[styles.tileIcon, tone].join(" ")} aria-hidden>
              <Icon size={20} />
            </span>
            <div>
              <div className={styles.tileValue}>{value}</div>
              <div className={styles.tileLabel}>{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Filas rechazadas</h2>
          {fileName ? <span className={styles.file}>{fileName}</span> : null}
        </div>
        {result.rejected.length === 0 ? (
          <p className={styles.empty}>Ninguna fila fue rechazada.</p>
        ) : (
          // En pantallas angostas la tabla se desplaza dentro de la tarjeta.
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hoja</th>
                  <th>Fila</th>
                  <th>Correo</th>
                  <th>Causa</th>
                </tr>
              </thead>
              <tbody>
                {result.rejected.map((row, index) => (
                  <tr key={`${row.sheet}-${row.row}-${index}`}>
                    <td>{row.sheet}</td>
                    <td className={styles.num}>{row.row}</td>
                    <td>{row.email || "—"}</td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {result.warnings.length > 0 ? (
        <Card padding={20}>
          <h2 className={styles.sectionTitle}>Advertencias</h2>
          <ul className={styles.warnings}>
            {result.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
