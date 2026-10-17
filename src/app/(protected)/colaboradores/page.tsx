"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, FileUp } from "lucide-react";
import type { AdminCollaboratorSummary } from "@/apis/interfaces/admin";
import type { AvailabilityStatus, CollaboratorSource } from "@/apis/interfaces/collaborator";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, IconButton, Input, Select, Spinner } from "@/components/atoms";
import type { SelectOption } from "@/components/atoms";
import { LoadingState, Pagination, SortableHeader, TableStatus } from "@/components/molecules";
import { RoleGuard } from "@/components/organisms";
import { useAdminCollaborators } from "@/modules/admin/hooks/useAdminCollaborators/useAdminCollaborators";
import { usePagedTable } from "@/hooks/usePagedTable";
import type { SortAccessors } from "@/utils/sort";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { toOptions } from "@/utils/to-options";
import {
  AVAILABILITY_OPTIONS,
  AVAILABILITY_VIEW,
  PERSON_TYPE_LABEL,
  ROLE_LABEL,
  SOURCE_LABEL,
} from "@/modules/collaborator/utils/collaborator-view";
import styles from "./colaboradores.module.css";

type AccountFilter = "ALL" | "WITH_USER" | "WITHOUT_USER";

const ACCOUNT_OPTIONS: SelectOption<AccountFilter>[] = [
  { value: "ALL", label: "Todas las cuentas" },
  { value: "WITH_USER", label: "Con usuario" },
  { value: "WITHOUT_USER", label: "Sin usuario" },
];

const SOURCE_OPTIONS: SelectOption<CollaboratorSource | "ALL">[] = [
  { value: "ALL", label: "Todos los orígenes" },
  ...toOptions(SOURCE_LABEL),
];

const AVAILABILITY_FILTER_OPTIONS: SelectOption<AvailabilityStatus | "ALL">[] = [
  { value: "ALL", label: "Toda disponibilidad" },
  ...AVAILABILITY_OPTIONS,
];

type CollaboratorSortKey = "person" | "program" | "account" | "availability" | "skills" | "source";

// Disponibilidad por cercanía a poder colaborar, no alfabética.
const AVAILABILITY_RANK: Record<AvailabilityStatus, number> = { DISPONIBLE: 0, PARCIAL: 1, NO_DISPONIBLE: 2 };

/** El programa sale de un catálogo: se resuelve con el mapa de la pantalla. */
function collaboratorSort(programNameById: Record<string, string>): SortAccessors<AdminCollaboratorSummary, CollaboratorSortKey> {
  return {
    person: (row) => `${row.firstName} ${row.lastName}`,
    program: (row) => programNameById[row.programId],
    account: (row) => (row.user ? ROLE_LABEL[row.user.role] : "Sin usuario"),
    availability: (row) => AVAILABILITY_RANK[row.availabilityStatus],
    skills: (row) => row.skillsCount,
    source: (row) => SOURCE_LABEL[row.source],
  };
}

const PAGE_SIZE = 20;

function matches(
  collaborator: AdminCollaboratorSummary,
  query: string,
  account: AccountFilter,
  source: CollaboratorSource | "ALL",
  availability: AvailabilityStatus | "ALL",
) {
  const text = `${collaborator.firstName} ${collaborator.lastName} ${collaborator.email}`.toLowerCase();
  if (query && !text.includes(query)) return false;
  if (account === "WITH_USER" && !collaborator.user) return false;
  if (account === "WITHOUT_USER" && collaborator.user) return false;
  if (source !== "ALL" && collaborator.source !== source) return false;
  if (availability !== "ALL" && collaborator.availabilityStatus !== availability) return false;
  return true;
}

function CollaboratorsList() {
  const router = useRouter();
  const { collaborators, ...server } = useAdminCollaborators();
  const { meta, isLoading } = server;
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState<AccountFilter>("ALL");
  const [source, setSource] = useState<CollaboratorSource | "ALL">("ALL");
  const [availability, setAvailability] = useState<AvailabilityStatus | "ALL">("ALL");

  const programNameById = Object.fromEntries(programs.map((program) => [program.id, program.name]));
  const normalized = query.trim().toLowerCase();
  const hasActiveFilter = Boolean(normalized) || account !== "ALL" || source !== "ALL" || availability !== "ALL";
  // Con búsqueda, filtros u orden se revisan todas las personas (todas las páginas), no solo la cargada.
  const table = usePagedTable({
    server: { ...server, items: collaborators },
    url: "/admin/collaborators",
    key: "collaborators",
    errorMessage: "No se pudieron buscar los colaboradores.",
    accessors: collaboratorSort(programNameById),
    pageSize: PAGE_SIZE,
    filter: (collaborator) => matches(collaborator, normalized, account, source, availability),
    filterKey: hasActiveFilter ? [normalized, account, source, availability].join("|") : "",
  });
  const { sort, toggleSort } = table;
  const showTable = !table.isLoading && (table.rows.length > 0 || table.isSorted);

  return (
    <PageGrid
      width="wide"
      header={
        <div className={styles.head}>
          <div>
            <h1 className={styles.h1}>Colaboradores</h1>
            <p className={styles.subtitle}>
              {isLoading || !meta ? "Personas con perfil técnico, con o sin usuario." : `${meta.total} personas con perfil técnico.`}
            </p>
          </div>
          <Button leftIcon={<FileUp />} onClick={() => router.push("/importar")}>
            Importar desde Excel
          </Button>
        </div>
      }
    >
      <div className={styles.stack}>
        <Card padding={16}>
          <div className={styles.filters}>
            <Input
              label="Buscar"
              placeholder="Nombre o correo"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              label="Cuenta"
              options={ACCOUNT_OPTIONS}
              value={account}
              onValueChange={setAccount}
            />
            <Select label="Origen" options={SOURCE_OPTIONS} value={source} onValueChange={setSource} />
            <Select
              label="Disponibilidad"
              options={AVAILABILITY_FILTER_OPTIONS}
              value={availability}
              onValueChange={setAvailability}
            />
          </div>
        </Card>

        <Card padding={0}>
          {table.isLoading ? (
            <LoadingState message={hasActiveFilter ? "Buscando en todos los colaboradores…" : "Cargando colaboradores…"} />
          ) : null}
          {!table.isLoading && table.error && !showTable ? <p className={styles.state}>{table.error}</p> : null}
          {!table.isLoading && !table.error && !hasActiveFilter && table.rows.length === 0 ? (
            <p className={styles.state}>
              Aún no hay perfiles técnicos. Puedes cargarlos con la <Link href="/importar">plantilla de Excel</Link>.
            </p>
          ) : null}
          {!table.isLoading && !table.error && hasActiveFilter && table.rows.length === 0 ? (
            <p className={styles.state}>Ningún colaborador coincide con los filtros.</p>
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
            // En pantallas angostas la tabla se desplaza dentro de la tarjeta.
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <SortableHeader label="Persona" sortKey="person" sort={sort} onSort={toggleSort} />
                    <SortableHeader
                      label="Programa"
                      sortKey="program"
                      sort={sort}
                      onSort={toggleSort}
                      disabled={isLoadingPrograms}
                    />
                    <SortableHeader label="Cuenta" sortKey="account" sort={sort} onSort={toggleSort} />
                    <SortableHeader label="Disponibilidad" sortKey="availability" sort={sort} onSort={toggleSort} />
                    <SortableHeader
                      label="Habilidades"
                      sortKey="skills"
                      sort={sort}
                      onSort={toggleSort}
                      className={styles.num}
                      align="end"
                    />
                    <SortableHeader label="Origen" sortKey="source" sort={sort} onSort={toggleSort} />
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((collaborator) => {
                    const view = AVAILABILITY_VIEW[collaborator.availabilityStatus];
                    return (
                      <tr key={collaborator.id}>
                        <td>
                          <span className={styles.name}>
                            {collaborator.firstName} {collaborator.lastName}
                          </span>
                          <span className={styles.muted}>{collaborator.email}</span>
                        </td>
                        <td>
                          <span>{isLoadingPrograms ? <Spinner size="sm" label="Cargando programa" /> : (programNameById[collaborator.programId] ?? "—")}</span>
                          <span className={styles.muted}>{PERSON_TYPE_LABEL[collaborator.personType]}</span>
                        </td>
                        <td>
                          {collaborator.user ? (
                            <Badge tone={collaborator.user.active ? "green" : "gray"} dot>
                              {ROLE_LABEL[collaborator.user.role]}
                            </Badge>
                          ) : (
                            <Badge tone="amber">Sin usuario</Badge>
                          )}
                        </td>
                        <td>
                          <Badge tone={view.tone}>{view.label}</Badge>
                          <span className={styles.muted}>{collaborator.weeklyHours} h/semana</span>
                        </td>
                        <td className={styles.num}>{collaborator.skillsCount}</td>
                        <td className={styles.muted}>{SOURCE_LABEL[collaborator.source]}</td>
                        <td className={styles.action}>
                          <IconButton
                            variant="plain"
                            size="sm"
                            icon={<Eye />}
                            href={`/colaboradores/${collaborator.id}`}
                            label={`Ver el perfil de ${collaborator.firstName} ${collaborator.lastName}`}
                            tooltip="Ver perfil técnico"
                            tooltipAlign="end"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
          {!table.isLoading && table.meta ? <Pagination meta={table.meta} onPageChange={table.onPageChange} /> : null}
        </Card>
      </div>
    </PageGrid>
  );
}

export default function ColaboradoresPage() {
  return (
    <AppShell>
      <RoleGuard roles={["ADMIN"]}>
        <CollaboratorsList />
      </RoleGuard>
    </AppShell>
  );
}
