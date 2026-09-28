"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell, PageGrid } from "@/components/templates";
import { Button, Card } from "@/components/atoms";
import { LoadingState } from "@/components/molecules";
import { ImportResultTable, RoleGuard } from "@/components/organisms";
import { useImportRun } from "@/modules/admin/hooks/useImportRun/useImportRun";
import { formatDate } from "@/utils/dates";
import styles from "./detalle.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function ImportRunDetail({ id }: { id: string }) {
  const router = useRouter();
  const { run, isLoading, error } = useImportRun(id);

  if (isLoading) {
    return (
      <PageGrid>
        <LoadingState variant="page" message="Cargando importación…" />
      </PageGrid>
    );
  }

  if (!run) {
    return (
      <PageGrid>
        <Card padding={24}>
          <p className={styles.state}>{error || "No se encontró la importación."}</p>
          <div className={styles.stateAction}>
            <Button variant="ghost" onClick={() => router.push("/importar/historial")}>
              Volver al historial
            </Button>
          </div>
        </Card>
      </PageGrid>
    );
  }

  return (
    <PageGrid
      header={
        <div className={styles.head}>
          <div>
            <h1 className={styles.h1}>{run.fileName}</h1>
            <p className={styles.subtitle}>
              Importado el {formatDate(run.createdAt, DATE_OPTIONS)} por {run.importedBy?.fullName ?? "una cuenta eliminada"}
            </p>
          </div>
          <div className={styles.headActions}>
            <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => router.push("/importar/historial")}>
              Volver
            </Button>
          </div>
        </div>
      }
    >
      <ImportResultTable result={run} fileName={run.fileName} />
    </PageGrid>
  );
}

export default function ImportRunDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AppShell
      breadcrumb={
        <>
          Historial de importaciones <span className={styles.breadcrumbSep}>/</span>{" "}
          <span className={styles.breadcrumbCurrent}>Detalle</span>
        </>
      }
    >
      <RoleGuard roles={["ADMIN"]}>
        <ImportRunDetail id={id} />
      </RoleGuard>
    </AppShell>
  );
}
