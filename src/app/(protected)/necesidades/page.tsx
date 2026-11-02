"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AppShell, PageGrid } from "@/components/templates";
import { Button, Card, Select } from "@/components/atoms";
import { LoadingState, NeedListItem, Pagination } from "@/components/molecules";
import { useAuth } from "@/contexts/auth-context";
import { useNeeds } from "@/modules/needs/hooks/useNeeds/useNeeds";
import {
  NEED_KIND_LABEL,
  NEED_SORT_OPTIONS,
  NEED_STATUS_FILTER_OPTIONS,
  NEED_STATUS_VIEW,
  PRIORITY_VIEW,
  formatScore,
} from "@/modules/needs/utils/need-view";
import { formatDate } from "@/modules/projects/utils/project-view";
import styles from "./necesidades.module.css";

/** Tesis (D1, D4): necesidades con su prioridad y completitud. El LIDER ve las suyas; el ADMIN, todas. */
export default function NecesidadesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { needs, meta, setPage, sort, setSort, status, setStatus, isLoading, error, reload } = useNeeds();

  return (
    <AppShell>
      <PageGrid
        width="wide"
        header={
          <div className={styles.head}>
            <div>
              <h1 className={styles.h1}>{isAdmin ? "Necesidades institucionales" : "Mis necesidades"}</h1>
              <p className={styles.sub}>
                Registra una necesidad con tus palabras, caracterízala con IA y conviértela en una oportunidad
                (proyecto).
              </p>
            </div>
            {!isAdmin ? (
              <Button leftIcon={<Plus />} onClick={() => router.push("/necesidades/nueva")}>
                Registrar necesidad
              </Button>
            ) : null}
          </div>
        }
      >
        <Card padding={0}>
          <div className={styles.filters}>
            <Select label="Ordenar" options={NEED_SORT_OPTIONS} value={sort} onValueChange={setSort} />
            <Select label="Estado" options={NEED_STATUS_FILTER_OPTIONS} value={status} onValueChange={setStatus} />
          </div>
          {isLoading ? <LoadingState message="Cargando necesidades…" /> : null}
          {!isLoading && error ? (
            <div className={styles.state}>
              <p>{error}</p>
              <Button variant="ghost" onClick={() => void reload()}>
                Reintentar
              </Button>
            </div>
          ) : null}
          {!isLoading && !error && needs.length === 0 ? (
            <p className={styles.state}>
              {status
                ? "No hay necesidades en este estado."
                : isAdmin
                  ? "Todavía no hay necesidades registradas."
                  : "Aún no has registrado necesidades."}
            </p>
          ) : null}
          {!isLoading && !error
            ? needs.map((need, index) => (
                <NeedListItem
                  key={need.id}
                  bordered={index < needs.length - 1}
                  need={{
                    title: need.title,
                    meta: [
                      NEED_KIND_LABEL[need.kind],
                      need.dependency,
                      `Registrada el ${formatDate(need.createdAt)}`,
                    ]
                      .filter(Boolean)
                      .join(" · "),
                    status: NEED_STATUS_VIEW[need.status],
                    priority: {
                      ...PRIORITY_VIEW[need.priorityLevel],
                      score: formatScore(need.priorityScore),
                      value: need.priorityScore,
                    },
                    completeness: need.completeness,
                    href: `/necesidades/${need.id}`,
                  }}
                />
              ))
            : null}
          {!isLoading && !error && meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
        </Card>
      </PageGrid>
    </AppShell>
  );
}
