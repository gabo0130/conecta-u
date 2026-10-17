"use client";

import { Eye } from "lucide-react";
import type { ImportRunSummary } from "@/apis/interfaces/admin";
import { AppShell, PageGrid } from "@/components/templates";
import { Card, IconButton } from "@/components/atoms";
import { LoadingState, Pagination, SortableHeader, TableStatus } from "@/components/molecules";
import { RoleGuard } from "@/components/organisms";
import { useImportRuns } from "@/modules/admin/hooks/useImportRuns/useImportRuns";
import { usePagedTable } from "@/hooks/usePagedTable";
import { formatDate } from "@/utils/dates";
import type { SortAccessors } from "@/utils/sort";
import styles from "./historial.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

type RunSortKey = "date" | "file" | "admin" | "created" | "rejected";

const RUN_SORT: SortAccessors<ImportRunSummary, RunSortKey> = {
  date: (run) => Date.parse(run.createdAt),
  file: (run) => run.fileName,
  admin: (run) => run.importedBy?.fullName,
  created: (run) => run.created,
  rejected: (run) => run.rejectedCount,
};

const PAGE_SIZE = 20;

function ImportRunsHistory() {
  const { runs, ...server } = useImportRuns();
  const table = usePagedTable({
    server: { ...server, items: runs },
    url: "/admin/import/collaborators/runs",
    key: "runs",
    errorMessage: "No se pudo ordenar el historial.",
    accessors: RUN_SORT,
    pageSize: PAGE_SIZE,
  });
  const { sort, toggleSort } = table;
  const showTable = !table.isLoading && (table.rows.length > 0 || table.isSorted);

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
        {table.isLoading ? <LoadingState message="Cargando historial…" /> : null}
        {!table.isLoading && table.error && !showTable ? <p className={styles.state}>{table.error}</p> : null}
        {!table.isLoading && !table.error && table.rows.length === 0 ? (
          <p className={styles.state}>Todavía no se ha importado ningún archivo.</p>
        ) : null}
        {showTable ? (
          <TableStatus
            isRefreshing={table.isRefreshing}
            error={table.error}
            onRetry={table.retry}
            onClearSort={table.isSorted ? table.clearSort : undefined}
          />
        ) : null}
        {showTable ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortableHeader label="Fecha" sortKey="date" sort={sort} onSort={toggleSort} />
                  <SortableHeader label="Archivo" sortKey="file" sort={sort} onSort={toggleSort} />
                  <SortableHeader label="Admin" sortKey="admin" sort={sort} onSort={toggleSort} />
                  <SortableHeader
                    label="Creados"
                    sortKey="created"
                    sort={sort}
                    onSort={toggleSort}
                    className={styles.num}
                    align="end"
                  />
                  <SortableHeader
                    label="Rechazados"
                    sortKey="rejected"
                    sort={sort}
                    onSort={toggleSort}
                    className={styles.num}
                    align="end"
                  />
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {table.rows.map((run) => (
                  <tr key={run.id}>
                    <td>{formatDate(run.createdAt, DATE_OPTIONS)}</td>
                    <td>{run.fileName}</td>
                    <td className={styles.muted}>{run.importedBy?.fullName ?? "cuenta eliminada"}</td>
                    <td className={`${styles.num} ${styles.ok}`}>{run.created}</td>
                    <td className={`${styles.num} ${run.rejectedCount > 0 ? styles.bad : ""}`}>{run.rejectedCount}</td>
                    <td className={styles.action}>
                      <IconButton
                        variant="plain"
                        size="sm"
                        icon={<Eye />}
                        href={`/importar/historial/${run.id}`}
                        label={`Ver el detalle de ${run.fileName}`}
                        tooltip="Ver filas aceptadas y rechazadas"
                        tooltipAlign="end"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!table.isLoading && table.meta ? <Pagination meta={table.meta} onPageChange={table.onPageChange} /> : null}
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
