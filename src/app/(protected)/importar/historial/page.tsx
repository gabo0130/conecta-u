"use client";

import Link from "next/link";
import { AppShell, PageGrid } from "@/components/templates";
import { Card } from "@/components/atoms";
import { LoadingState, Pagination } from "@/components/molecules";
import { RoleGuard } from "@/components/organisms";
import { useImportRuns } from "@/modules/admin/hooks/useImportRuns/useImportRuns";
import { formatDate } from "@/utils/dates";
import styles from "./historial.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function ImportRunsHistory() {
  const { runs, meta, setPage, isLoading, error } = useImportRuns();

  return (
    <PageGrid
      header={
        <div className={styles.head}>
          <div>
            <h1 className={styles.h1}>Historial de importaciones</h1>
            <p className={styles.subtitle}>Cada carga de colaboradores por Excel, con sus filas aceptadas y rechazadas.</p>
          </div>
        </div>
      }
    >
      <Card padding={0}>
        {isLoading ? <LoadingState message="Cargando historial…" /> : null}
        {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
        {!isLoading && !error && runs.length === 0 ? (
          <p className={styles.state}>Todavía no se ha importado ningún archivo.</p>
        ) : null}
        {!isLoading && !error && runs.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Archivo</th>
                  <th>Admin</th>
                  <th className={styles.num}>Creados</th>
                  <th className={styles.num}>Rechazados</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td>{formatDate(run.createdAt, DATE_OPTIONS)}</td>
                    <td>{run.fileName}</td>
                    <td className={styles.muted}>{run.importedBy?.fullName ?? "cuenta eliminada"}</td>
                    <td className={`${styles.num} ${styles.ok}`}>{run.created}</td>
                    <td className={`${styles.num} ${run.rejectedCount > 0 ? styles.bad : ""}`}>{run.rejectedCount}</td>
                    <td className={styles.action}>
                      <Link href={`/importar/historial/${run.id}`}>Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!isLoading && !error && meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
      </Card>
    </PageGrid>
  );
}

export default function ImportHistoryPage() {
  return (
    <AppShell
      breadcrumb={
        <>
          Importar colaboradores <span className={styles.breadcrumbSep}>/</span>{" "}
          <span className={styles.breadcrumbCurrent}>Historial</span>
        </>
      }
    >
      <RoleGuard roles={["ADMIN"]}>
        <ImportRunsHistory />
      </RoleGuard>
    </AppShell>
  );
}
