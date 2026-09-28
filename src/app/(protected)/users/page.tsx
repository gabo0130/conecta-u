"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card } from "@/components/atoms";
import { LoadingState, Pagination } from "@/components/molecules";
import { RoleGuard, UserModal } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useUsers } from "@/modules/admin/hooks/useUsers/useUsers";
import type { AdminUser } from "@/apis/interfaces/admin";
import { ROLE_LABEL } from "@/modules/collaborator/utils/collaborator-view";
import styles from "./users.module.css";

function UsersList() {
  const { user } = useAuth();
  const { users, meta, setPage, isLoading, error, createUser, updateUser, deleteUser } = useUsers();
  const [modal, setModal] = useState<{ user?: AdminUser } | null>(null);
  const editing = modal?.user;

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
        {isLoading ? <LoadingState message="Cargando usuarios…" /> : null}
        {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
        {!isLoading && !error && users.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>
                    <span className={styles.srOnly}>Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
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
                      <Button
                        variant="link"
                        size="sm"
                        aria-label={`Editar a ${row.fullName}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setModal({ user: row });
                        }}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!isLoading && !error && users.length === 0 ? (
          <p className={styles.state}>Aún no hay usuarios registrados.</p>
        ) : null}
        {!isLoading && !error && meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
      </Card>

      {modal ? (
        <UserModal
          user={editing}
          onCreate={createUser}
          onUpdate={(payload) => updateUser(editing!.id, payload)}
          // El backend no deja que el ADMIN borre su propia cuenta: no se ofrece la acción.
          onDelete={editing && editing.id !== user?.id ? () => deleteUser(editing.id) : undefined}
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
