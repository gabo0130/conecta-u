"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/templates";
import { Badge, Button, Card } from "@/components/atoms";
import { UserModal } from "@/components/organisms";
import { useAuth } from "@/contexts/auth-context";
import { useUsers } from "@/modules/admin/hooks/useUsers/useUsers";
import type { AdminUser } from "@/apis/interfaces/admin";
import styles from "./users.module.css";

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  LIDER: "Líder de proyecto",
  COLABORADOR: "Colaborador",
  ADMIN: "Administrador",
};

export default function UsersPage() {
  const { user } = useAuth();
  const { users, isLoading, error, createUser, updateUser, deleteUser } = useUsers();
  const [modal, setModal] = useState<{ user?: AdminUser } | null>(null);

  if (user?.role !== "ADMIN") {
    return (
      <AppShell>
        <Card padding={24}>
          <p className={styles.state}>No tienes permisos para ver esta página.</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Usuarios</h1>
          <p className={styles.subtitle}>Gestiona las cuentas de la plataforma.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setModal({})}>
          Crear usuario
        </Button>
      </div>

      <Card padding={0}>
        {isLoading ? <p className={styles.state}>Cargando usuarios…</p> : null}
        {!isLoading && error ? <p className={styles.state}>{error}</p> : null}
        {!isLoading && !error ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th aria-hidden />
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
                    <td className={styles.editCol}>Editar</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!isLoading && !error && users.length === 0 ? (
          <p className={styles.state}>Aún no hay usuarios registrados.</p>
        ) : null}
      </Card>

      {modal ? (
        <UserModal
          user={modal.user}
          onSubmit={(payload) =>
            modal.user
              ? updateUser(modal.user.id, payload as Parameters<typeof updateUser>[1])
              : createUser(payload as Parameters<typeof createUser>[0])
          }
          onDelete={modal.user ? () => deleteUser(modal.user!.id) : undefined}
          onClose={() => setModal(null)}
        />
      ) : null}
    </AppShell>
  );
}
