import type { AnalysisSummary } from "@/apis/interfaces/analysis";
import type { PageMeta } from "@/apis/interfaces/pagination";
import { ANALYSIS_STATUS_VIEW } from "@/modules/analysis/utils/analysis-view";
import { formatDate } from "@/utils/dates";
import { Badge, Card, Spinner } from "../../atoms";
import { Pagination } from "../Pagination/Pagination";
import styles from "./AnalysisHistoryList.module.css";

type AnalysisHistoryListProps = {
  analyses: AnalysisSummary[];
  meta: PageMeta | null;
  isLoading: boolean;
  error: string;
  onPageChange: (page: number) => void;
};

const DATE_TIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

/** Historial compacto de intentos de análisis: fecha, estado (con el error si falló) y modelo. */
export function AnalysisHistoryList({ analyses, meta, isLoading, error, onPageChange }: AnalysisHistoryListProps) {
  return (
    <Card padding={20}>
      <h2 className={styles.title}>Historial de análisis</h2>
      {isLoading ? <Spinner size="sm" label="Cargando historial" /> : null}
      {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
      {!isLoading && !error && analyses.length === 0 ? <p className={styles.state}>Aún no hay intentos de análisis.</p> : null}
      {!isLoading && !error && analyses.length > 0 ? (
        <ol className={styles.list}>
          {analyses.map((item) => {
            const status = ANALYSIS_STATUS_VIEW[item.status];
            return (
              <li key={item.id} className={styles.item}>
                <div className={styles.row}>
                  <time dateTime={item.createdAt} className={styles.date}>
                    {formatDate(item.createdAt, DATE_TIME)}
                  </time>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className={styles.meta}>
                  {item.model}
                  {item.durationMs ? ` · ${Math.round(item.durationMs / 1000)} s` : ""}
                </p>
                {item.status === "ERROR" && item.errorMessage ? (
                  <p className={styles.error} title={item.errorMessage}>
                    {item.errorMessage}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
      {!isLoading && meta && meta.totalPages > 1 ? <Pagination meta={meta} onPageChange={onPageChange} compact /> : null}
    </Card>
  );
}
