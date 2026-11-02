"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Power, PowerOff } from "lucide-react";
import { AppShell, PageGrid } from "@/components/templates";
import { Badge, Button, Card, UserAvatar } from "@/components/atoms";
import { IdentificationSummary, LoadingState } from "@/components/molecules";
import { CollaboratorView, IdentificationModal, PersonModal, RoleGuard } from "@/components/organisms";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import { useAdminCollaborator } from "@/modules/admin/hooks/useAdminCollaborator/useAdminCollaborator";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import { PERSON_TYPE_LABEL, ROLE_LABEL, getInitials } from "@/modules/collaborator/utils/collaborator-view";
import styles from "./detalle.module.css";

function CollaboratorDetail({ id }: { id: string }) {
  const router = useRouter();
  const { collaborator, isLoading, error, updateIdentification, updateProfile, setActive, viewCertificate } =
    useAdminCollaborator(id);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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

  // RF17: dar de baja la saca de recomendaciones y convocatorias; reactivar la vuelve a incluir.
  const toggleActive = async () => {
    const deactivate = collaborator.active;
    const accepted = await notify.confirm({
      title: deactivate ? `¿Dar de baja a ${fullName}?` : `¿Reactivar a ${fullName}?`,
      message: deactivate
        ? "Dejará de aparecer en las recomendaciones y no se le podrán enviar convocatorias. Se borran sus recomendaciones guardadas; su perfil y su cuenta se conservan."
        : "Volverá a aparecer en las recomendaciones la próxima vez que un líder las genere.",
      confirmLabel: deactivate ? "Dar de baja" : "Reactivar",
      tone: deactivate ? "danger" : "default",
    });
    if (!accepted) return;
    try {
      await loading.run(setActive(!deactivate), deactivate ? "Dando de baja…" : "Reactivando…");
      void notify.success(deactivate ? `${fullName} quedó dada de baja.` : `${fullName} quedó activa de nuevo.`);
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo cambiar el estado de la persona."));
    }
  };

  const openCertificate = (experienceId: string) => {
    viewCertificate(experienceId).catch((err: unknown) =>
      notify.error(getErrorMessage(err, "No se pudo abrir el certificado.")),
    );
  };

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
            <Button variant="ghost" leftIcon={<Pencil />} onClick={() => setIsEditingProfile(true)}>
              Editar perfil
            </Button>
            <Button
              variant={collaborator.active ? "ghost" : "primary"}
              leftIcon={collaborator.active ? <PowerOff /> : <Power />}
              onClick={() => void toggleActive()}
            >
              {collaborator.active ? "Dar de baja" : "Reactivar"}
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
        <CollaboratorView
          collaborator={collaborator}
          programName={programName}
          isProgramLoading={isLoadingPrograms}
          onViewCertificate={openCertificate}
        />
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
      {isEditingProfile ? (
        <PersonModal mode="edit" person={collaborator} onUpdate={updateProfile} onClose={() => setIsEditingProfile(false)} />
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
