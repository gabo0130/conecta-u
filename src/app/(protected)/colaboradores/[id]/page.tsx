"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, UserAvatar } from "@/components/atoms";
import { IdentificationSummary, LoadingState } from "@/components/molecules";
import { CollaboratorView, IdentificationModal, RoleGuard } from "@/components/organisms";
import { useAdminCollaborator } from "@/modules/admin/hooks/useAdminCollaborator/useAdminCollaborator";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { PERSON_TYPE_LABEL, ROLE_LABEL, getInitials } from "@/modules/collaborator/utils/collaborator-view";
import styles from "./detalle.module.css";

function CollaboratorDetail({ id }: { id: string }) {
  const router = useRouter();
  const { collaborator, isLoading, error, updateIdentification } = useAdminCollaborator(id);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const { programs, isLoading: isLoadingPrograms } = useProgramsCatalog();

  if (isLoading) {
    return (
      <PageGrid>
        <LoadingState variant="page" message="Cargando perfil…" />
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
                {!collaborator.identificationComplete ? <Badge tone="amber">Datos incompletos</Badge> : null}
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
      <div className={styles.stack}>
        <IdentificationSummary
          person={collaborator}
          onEdit={() => setIsEditingIdentity(true)}
          incompleteMessage="A esta persona le faltan el documento o el teléfono (registrada o importada antes de v2.1)."
        />
        <CollaboratorView collaborator={collaborator} programName={programName} isProgramLoading={isLoadingPrograms} />
      </div>
      {isEditingIdentity ? (
        <IdentificationModal
          person={collaborator}
          email={collaborator.email}
          canChangeDocument
          onSubmit={updateIdentification}
          onClose={() => setIsEditingIdentity(false)}
          successMessage={`Los datos de identificación de ${fullName} se guardaron.`}
        />
      ) : null}
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
