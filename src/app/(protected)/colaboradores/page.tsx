"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import type { AdminCollaboratorSummary } from "@/apis/interfaces/admin";
import type { AvailabilityStatus, CollaboratorSource } from "@/apis/interfaces/collaborator";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, Input, Select } from "@/components/atoms";
import { Pagination } from "@/components/molecules";
import { RoleGuard } from "@/components/organisms";
import { useAdminCollaborators } from "@/modules/admin/hooks/useAdminCollaborators/useAdminCollaborators";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import {
  AVAILABILITY_VIEW,
  PERSON_TYPE_LABEL,
  ROLE_LABEL,
  SOURCE_LABEL,
} from "@/modules/collaborator/utils/collaborator-view";
import styles from "./colaboradores.module.css";

type AccountFilter = "ALL" | "WITH_USER" | "WITHOUT_USER";

const ACCOUNT_OPTIONS: { value: AccountFilter; label: string }[] = [
  { value: "ALL", label: "Todas las cuentas" },
  { value: "WITH_USER", label: "Con usuario" },
  { value: "WITHOUT_USER", label: "Sin usuario" },
];

const SOURCE_OPTIONS = [
  { value: "ALL", label: "Todos los orígenes" },
  ...Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label })),
];

const AVAILABILITY_OPTIONS = [
  { value: "ALL", label: "Toda disponibilidad" },
  ...Object.entries(AVAILABILITY_VIEW).map(([value, view]) => ({ value, label: view.label })),
];

function matches(
  collaborator: AdminCollaboratorSummary,
  query: string,
  account: AccountFilter,
  source: string,
  availability: string,
) {
  const text = `${collaborator.firstName} ${collaborator.lastName} ${collaborator.email}`.toLowerCase();
  if (query && !text.includes(query)) return false;
  if (account === "WITH_USER" && !collaborator.user) return false;
  if (account === "WITHOUT_USER" && collaborator.user) return false;
  if (source !== "ALL" && collaborator.source !== (source as CollaboratorSource)) return false;
  if (availability !== "ALL" && collaborator.availabilityStatus !== (availability as AvailabilityStatus)) return false;
  return true;
}

function CollaboratorsList() {
  const router = useRouter();
  const { collaborators, meta, setPage, isLoading, error } = useAdminCollaborators();
  const { programs } = useProgramsCatalog();
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState<AccountFilter>("ALL");
  const [source, setSource] = useState("ALL");
  const [availability, setAvailability] = useState("ALL");

  const programNameById = Object.fromEntries(programs.map((program) => [program.id, program.name]));
  const normalized = query.trim().toLowerCase();
  const hasActiveFilter = Boolean(normalized) || account !== "ALL" || source !== "ALL" || availability !== "ALL";
  const visible = collaborators.filter((collaborator) =>
    matches(collaborator, normalized, account, source, availability),
  );

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
              onChange={(event) => setAccount(event.target.value as AccountFilter)}
            />
            <Select label="Origen" options={SOURCE_OPTIONS} value={source} onChange={(event) => setSource(event.target.value)} />
            <Select
              label="Disponibilidad"
              options={AVAILABILITY_OPTIONS}
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            />
          </div>
        </Card>

        <Card padding={0}>
          {isLoading ? <p className={styles.state}>Cargando colaboradores…</p> : null}
          {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
          {!isLoading && !error && collaborators.length === 0 ? (
            <p className={styles.state}>
              Aún no hay perfiles técnicos. Puedes cargarlos con la <Link href="/importar">plantilla de Excel</Link>.
            </p>
          ) : null}
          {!isLoading && !error && hasActiveFilter ? (
            <p className={styles.searchHint}>Los filtros solo revisan los colaboradores ya cargados en esta página.</p>
          ) : null}
          {!isLoading && !error && collaborators.length > 0 && visible.length === 0 ? (
            <p className={styles.state}>Ningún colaborador coincide con los filtros.</p>
          ) : null}
          {!isLoading && !error && visible.length > 0 ? (
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
                          <span>{programNameById[collaborator.programId] ?? "—"}</span>
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
          {!isLoading && !error && !hasActiveFilter && meta ? (
            <Pagination meta={meta} onPageChange={setPage} />
          ) : null}
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
