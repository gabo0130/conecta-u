"use client";

import { RefreshCw } from "lucide-react";
import type { Invitation } from "@/apis/interfaces/invitations";
import { INVITATION_STATUS_VIEW } from "@/modules/invitations/utils/invitation-view";
import { Badge, Button, Card } from "../../atoms";
import { LoadingState } from "../../molecules";
import styles from "./InvitationHistory.module.css";

type InvitationHistoryProps = {
  invitations: Invitation[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
};

const DATE_TIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

/** RF22: historial de convocatorias del proyecto (fecha, destinatario y estado del envío). */
export function InvitationHistory({ invitations, isLoading, error, onRetry }: InvitationHistoryProps) {
  return (
    <Card padding={0}>
      <div className={styles.head}>
        <h2 className={styles.title}>Convocatorias enviadas</h2>
        <span className={styles.count}>{isLoading ? "" : invitations.length}</span>
      </div>
      {isLoading ? <LoadingState message="Cargando historial…" /> : null}
      {!isLoading && error ? (
        <div className={styles.state}>
          <p>{error}</p>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw />} onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : null}
      {!isLoading && !error && invitations.length === 0 ? (
        <p className={styles.state}>Aún no se han enviado convocatorias para este proyecto.</p>
      ) : null}
      {!isLoading && !error && invitations.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Destinatario</th>
                <th scope="col">Perfil</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => {
                const status = INVITATION_STATUS_VIEW[invitation.status];
                return (
                  <tr key={invitation.id}>
                    <td className={styles.nowrap}>{new Date(invitation.sentAt).toLocaleString("es-CO", DATE_TIME)}</td>
                    <td>
                      <span className={styles.name}>{invitation.recipientName}</span>
                      <span className={styles.email}>{invitation.recipientEmail}</span>
                    </td>
                    <td>{invitation.profileName ?? "—"}</td>
                    <td>
                      <Badge tone={status.tone} title={invitation.errorMessage ?? undefined}>
                        {status.label}
                      </Badge>
                      {invitation.errorMessage ? <span className={styles.error}>{invitation.errorMessage}</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}
