"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import type { AdminCollaboratorSummary } from "@/apis/interfaces/admin";
import type { AvailabilityStatus, CollaboratorSource } from "@/apis/interfaces/collaborator";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, Input, Select, Spinner } from "@/components/atoms";
import type { SelectOption } from "@/components/atoms";
import { LoadingState, Pagination } from "@/components/molecules";
import { RoleGuard } from "@/components/organisms";
import { useAdminCollaborators } from "@/modules/admin/hooks/useAdminCollaborators/useAdminCollaborators";
import { useAllPages } from "@/hooks/useAllPages";
import { paginateLocally } from "@/utils/paginate";
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
  const { collaborators, meta, setPage, isLoading, error } = useAdminCollaborators();
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState<AccountFilter>("ALL");
  const [source, setSource] = useState<CollaboratorSource | "ALL">("ALL");
  const [availability, setAvailability] = useState<AvailabilityStatus | "ALL">("ALL");

  const programNameById = Object.fromEntries(programs.map((program) => [program.id, program.name]));
  const normalized = query.trim().toLowerCase();
  const hasActiveFilter = Boolean(normalized) || account !== "ALL" || source !== "ALL" || availability !== "ALL";
  // Con búsqueda o filtros se revisan todas las personas (todas las páginas), no solo la cargada.
  const all = useAllPages<AdminCollaboratorSummary>(
    "/admin/collaborators",
    "collaborators",
    hasActiveFilter,
    "No se pudieron buscar los colaboradores.",
  );
  // La página de resultados vuelve a 1 cada vez que cambia la búsqueda o un filtro.
  const filterKey = [normalized, account, source, availability].join("|");
  const [filteredPage, setFilteredPage] = useState({ key: "", page: 1 });
  const filtered = paginateLocally(
    all.items.filter((collaborator) => matches(collaborator, normalized, account, source, availability)),
    filteredPage.key === filterKey ? filteredPage.page : 1,
    20,
  );
  const visible = hasActiveFilter ? filtered.pageItems : collaborators;
  const listMeta = hasActiveFilter ? filtered.meta : meta;
  const changePage = hasActiveFilter ? (page: number) => setFilteredPage({ key: filterKey, page }) : setPage;
  const loading = isLoading || (hasActiveFilter && all.isLoading);
  const listError = error || (hasActiveFilter ? all.error : "");

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
          {loading ? (
            <LoadingState message={hasActiveFilter ? "Buscando en todos los colaboradores…" : "Cargando colaboradores…"} />
          ) : null}
          {!loading && listError ? <p className={styles.state}>{listError}</p> : null}
          {!loading && !listError && !hasActiveFilter && collaborators.length === 0 ? (
            <p className={styles.state}>
              Aún no hay perfiles técnicos. Puedes cargarlos con la <Link href="/importar">plantilla de Excel</Link>.
            </p>
          ) : null}
          {!loading && !listError && hasActiveFilter && visible.length === 0 ? (
            <p className={styles.state}>Ningún colaborador coincide con los filtros.</p>
          ) : null}
          {!loading && !listError && visible.length > 0 ? (
            // En pantallas angostas la tabla se desplaza dentro de la tarjeta.
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Persona</th>
                    <th>Programa</th>
                    <th>Cuenta</th>
                    <th>Disponibilidad</th>
                    <th className={styles.num}>Habilidades</th>
                    <th>Origen</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((collaborator) => {
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
                          <Link href={`/colaboradores/${collaborator.id}`}>Ver perfil</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
          {!loading && !listError && listMeta ? <Pagination meta={listMeta} onPageChange={changePage} /> : null}
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
