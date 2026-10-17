"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, IconButton } from "@/components/atoms";
import { LoadingState, Pagination, SortableHeader, TableStatus } from "@/components/molecules";
import { RoleGuard, UserModal } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useUsers } from "@/modules/admin/hooks/useUsers/useUsers";
import { usePagedTable } from "@/hooks/usePagedTable";
import type { SortAccessors } from "@/utils/sort";
import type { AdminUser } from "@/apis/interfaces/admin";
import { ROLE_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import styles from "./users.module.css";

type UserSortKey = "name" | "email" | "role" | "status";

const USER_SORT: SortAccessors<AdminUser, UserSortKey> = {
  name: (row) => row.fullName,
  email: (row) => row.email,
  role: (row) => ROLE_LABEL[row.role],
  status: (row) => (row.active ? "Activo" : "Inactivo"),
};

const PAGE_SIZE = 20;

function UsersList() {
  const { user } = useAuth();
  const { users, createUser, updateUser, deleteUser, ...server } = useUsers();
  const [modal, setModal] = useState<{ user?: AdminUser } | null>(null);
  const editing = modal?.user;
  // Ordenar solo la página cargada engañaría: con un orden activo se ordenan todas las cuentas.
  const table = usePagedTable({
    server: { ...server, items: users },
    url: "/users",
    key: "users",
    errorMessage: "No se pudieron ordenar los usuarios.",
    accessors: USER_SORT,
    pageSize: PAGE_SIZE,
  });
  const { sort, toggleSort, withRefresh } = table;
  const showTable = !table.isLoading && (table.rows.length > 0 || table.isSorted);

  return (
    <PageGrid
      width="wide"
      header={
        <div className={styles.head}>
          <div>
            <h1 className={styles.h1}>Usuarios</h1>
            <p className={styles.subtitle}>Gestiona las cuentas de la plataforma.</p>
          </div>
          <Button leftIcon={<Plus size={18} />} onClick={() => setModal({})}>
            Crear usuario
          </Button>
        </div>
      }
    >
      <Card padding={0}>
        {table.isLoading ? <LoadingState message="Cargando usuarios…" /> : null}
        {!table.isLoading && table.error && !showTable ? <p className={styles.state}>{table.error}</p> : null}
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
                  <SortableHeader label="Nombre" sortKey="name" sort={sort} onSort={toggleSort} />
                  <SortableHeader label="Correo" sortKey="email" sort={sort} onSort={toggleSort} />
                  <SortableHeader label="Rol" sortKey="role" sort={sort} onSort={toggleSort} />
                  <SortableHeader label="Estado" sortKey="status" sort={sort} onSort={toggleSort} />
                  <th>
                    <span className={styles.srOnly}>Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.id} onClick={() => setModal({ user: row })} className={styles.row}>
                    <td>{row.fullName}</td>
                    <td>{row.email}</td>
                    <td>{ROLE_LABEL[row.role]}</td>
                    <td>
                      <Badge tone={row.active ? "green" : "gray"} dot>
                        {row.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className={styles.editCol}>
                      {/* Botón real: la fila clicable solo sirve con mouse; así también funciona con teclado. */}
                      <IconButton
                        variant="plain"
                        size="sm"
                        icon={<Pencil />}
                        label={`Editar a ${row.fullName}`}
                        tooltip="Editar cuenta, rol o estado"
                        tooltipAlign="end"
                        onClick={(event) => {
                          event.stopPropagation();
                          setModal({ user: row });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!table.isLoading && !table.error && table.rows.length === 0 ? (
          <p className={styles.state}>Aún no hay usuarios registrados.</p>
        ) : null}
        {!table.isLoading && table.meta ? <Pagination meta={table.meta} onPageChange={table.onPageChange} /> : null}
      </Card>

      {modal ? (
        <UserModal
          user={editing}
          onCreate={withRefresh(createUser)}
          onUpdate={withRefresh((payload) => updateUser(editing!.id, payload))}
          // El backend no deja que el ADMIN borre su propia cuenta: no se ofrece la acción.
          onDelete={editing && editing.id !== user?.id ? withRefresh(() => deleteUser(editing.id)) : undefined}
          onClose={() => setModal(null)}
        />
      ) : null}
    </PageGrid>
  );
}

export default function UsersPage() {
  return (
    <AppShell>
      <RoleGuard roles={["ADMIN"]}>
        <UsersList />
      </RoleGuard>
    </AppShell>
  );
}
