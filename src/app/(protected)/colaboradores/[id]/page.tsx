"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, UserAvatar } from "@/components/atoms";
import { CollaboratorView, RoleGuard } from "@/components/organisms";
import { useAdminCollaborator } from "@/modules/admin/hooks/useAdminCollaborator/useAdminCollaborator";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { PERSON_TYPE_LABEL, ROLE_LABEL, getInitials } from "@/modules/collaborator/utils/collaborator-view";
import styles from "./detalle.module.css";

function CollaboratorDetail({ id }: { id: string }) {
  const router = useRouter();
  const { collaborator, isLoading, error } = useAdminCollaborator(id);
  const { programs } = useProgramsCatalog();

  if (isLoading) {
    return (
      <PageGrid>
        <p className={styles.state}>Cargando perfil…</p>
      </PageGrid>
    );
  }

  if (!collaborator) {
    return (
      <PageGrid>
        <Card padding={24}>
          <p className={styles.state}>{error || "No se encontró el perfil."}</p>
          <div className={styles.stateAction}>
            <Button variant="ghost" onClick={() => router.push("/colaboradores")}>
              Volver a colaboradores
            </Button>
          </div>
        </Card>
      </PageGrid>
    );
  }

  const fullName = `${collaborator.firstName} ${collaborator.lastName}`;
  const programName = programs.find((program) => program.id === collaborator.programId)?.name;

  return (
    <PageGrid
      width="wide"
      header={
        <div className={styles.head}>
          <div className={styles.identity}>
            <UserAvatar initials={getInitials(fullName)} alt={fullName} size={56} radius={16} />
            <div className={styles.identityText}>
              <h1 className={styles.h1}>{fullName}</h1>
              <div className={styles.badges}>
                <Badge>{PERSON_TYPE_LABEL[collaborator.personType]}</Badge>
                {collaborator.user ? (
                  <Badge tone="green">{ROLE_LABEL[collaborator.user.role]}</Badge>
                ) : (
                  <Badge tone="amber">Sin usuario</Badge>
                )}
                {!collaborator.active ? <Badge tone="gray">Dado de baja</Badge> : null}
              </div>
            </div>
          </div>
          <div className={styles.headActions}>
            <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => router.push("/colaboradores")}>
              Volver
            </Button>
          </div>
        </div>
      }
    >
      <CollaboratorView collaborator={collaborator} programName={programName} />
    </PageGrid>
  );
}

export default function ColaboradorDetallePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AppShell
      breadcrumb={
        <>
          Colaboradores <span className={styles.breadcrumbSep}>/</span>{" "}
          <span className={styles.breadcrumbCurrent}>Perfil</span>
        </>
      }
    >
      <RoleGuard roles={["ADMIN"]}>
        <CollaboratorDetail id={id} />
      </RoleGuard>
    </AppShell>
  );
}
