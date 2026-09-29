"use client";

import { useState } from "react";
import type { Collaborator, CollaboratorSkill, Experience } from "@/apis/interfaces/collaborator";
import { AppShell } from "@/components/templates";
import { Badge, Button, Card, Chip, UserAvatar } from "@/components/atoms";
import { ExperienceItem, LoadingState } from "@/components/molecules";
import {
  AvailabilityModal,
  CreateProfileModal,
  EditProfileModal,
  ExperienceModal,
  SkillModal,
} from "@/components/organisms";
import { SKILL_TYPE_LABEL, SKILL_TYPE_TONE, groupBySoftSkill } from "@/components/organisms/SkillPicker/skill-type";
import { useAuth } from "@/contexts/auth-context";
import { useCollaborator } from "@/modules/collaborator/hooks/useCollaborator/useCollaborator";
import { useCreateCollaboratorProfile } from "@/modules/collaborator/hooks/useCreateCollaboratorProfile/useCreateCollaboratorProfile";
import { useProgramsCatalog } from "@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog";
import {
  AVAILABILITY_VIEW,
  LEVEL_LABEL,
  PERSON_TYPE_LABEL,
  getExperienceMeta,
  getInitials,
} from "@/modules/collaborator/utils/collaborator-view";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import styles from "./perfil.module.css";

type ModalState =
  | { kind: "profile" }
  | { kind: "availability" }
  | { kind: "skill"; skill?: CollaboratorSkill }
  | { kind: "experience"; experience?: Experience }
  | { kind: "create" }
  | null;

function getCompleteness(collaborator: Collaborator) {
  const checks = [
    collaborator.summary,
    collaborator.researchGroup,
    collaborator.profileUrl,
    collaborator.weeklyHours > 0,
    collaborator.skills.length > 0,
    collaborator.experiences.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function PerfilPage() {
  const { user } = useAuth();
  const {
    collaborator,
    isLoading,
    notFound,
    error,
    updateProfile,
    updateAvailability,
    addSkill,
    updateSkill,
    deleteSkill,
    addExperience,
    updateExperience,
    deleteExperience,
    reload,
  } = useCollaborator();
  const { createProfile } = useCreateCollaboratorProfile();
  const { programs } = useProgramsCatalog();
  const [modal, setModal] = useState<ModalState>(null);
  const closeModal = () => setModal(null);

  const handleDeleteExperience = async (experience: Experience) => {
    const accepted = await notify.confirm({
      title: "¿Eliminar experiencia?",
      message: `Se quitará "${experience.role}" en ${experience.organization} de tu perfil. Esta acción no se puede deshacer.`,
      tone: "danger",
    });
    if (!accepted) return;
    try {
      await deleteExperience(experience.id);
      void notify.success("La experiencia se eliminó de tu perfil.");
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo eliminar la experiencia."));
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState variant="page" message="Cargando perfil…" />
      </AppShell>
    );
  }

  if (notFound) {
    return (
      <AppShell>
        <Card padding={24}>
          <p className={styles.completeText}>
            {user?.role === "LIDER"
              ? "Aún no tienes un perfil de colaborador. Puedes crear uno para aparecer también como colaborador técnico."
              : "Aún no tienes un perfil de colaborador. Complétalo para aparecer en las recomendaciones de los líderes de proyecto."}
          </p>
          <Button onClick={() => setModal({ kind: "create" })}>Crear mi perfil</Button>
        </Card>
        {modal?.kind === "create" ? (
          <CreateProfileModal
            onSubmit={async (payload) => {
              await createProfile(payload);
              await reload();
            }}
            onClose={closeModal}
          />
        ) : null}
      </AppShell>
    );
  }

  if (!collaborator) {
    return (
      <AppShell>
        <Card padding={24}>
          <p className={styles.completeText}>{error || "No se pudo cargar el perfil."}</p>
        </Card>
      </AppShell>
    );
  }

  const availability = AVAILABILITY_VIEW[collaborator.availabilityStatus];
  const programName = programs.find((program) => program.id === collaborator.programId)?.name;
  const fullName = `${collaborator.firstName} ${collaborator.lastName}`;
  const meta = [PERSON_TYPE_LABEL[collaborator.personType], programName, collaborator.researchGroup]
    .filter(Boolean)
    .join(" · ");
  const completeness = getCompleteness(collaborator);
  const { technical: technicalSkills, soft: softSkills } = groupBySoftSkill(
    collaborator.skills,
    (skill) => skill.skill.type,
  );
  const renderSkillChip = (skill: CollaboratorSkill) => (
    <button
      key={skill.id}
      type="button"
      className={styles.chipBtn}
      aria-label={`Editar ${skill.skill.name}: ${SKILL_TYPE_LABEL[skill.skill.type]}, nivel ${LEVEL_LABEL[skill.level]}, ${skill.experienceMonths} meses${skill.lastUsedYear ? `, usado en ${skill.lastUsedYear}` : ""}`}
      onClick={() => setModal({ kind: "skill", skill })}
    >
      {/* Nivel y meses a la vista: antes solo salían en el tooltip (invisible en móvil). */}
      <Chip tone={SKILL_TYPE_TONE[skill.skill.type]}>
        {skill.skill.name}
        <span className={styles.chipMeta}>
          {LEVEL_LABEL[skill.level]} · {skill.experienceMonths} m
        </span>
      </Chip>
    </button>
  );

  return (
    <AppShell>
      <Card padding={24} className={styles.header}>
        <UserAvatar initials={getInitials(fullName)} alt={fullName} size={76} radius={20} />
        <div className={styles.headMain}>
          <div className={styles.headTop}>
            <h1 className={styles.name}>{fullName}</h1>
            <Badge tone={availability.tone} dot>
              {availability.label}
            </Badge>
          </div>
          <div className={styles.meta}>{meta || "Completa tu perfil para aparecer en las recomendaciones."}</div>
        </div>
        <Button variant="ghost" onClick={() => setModal({ kind: "profile" })}>
          Editar perfil
        </Button>
      </Card>

      <div className={styles.grid}>
        <div className={styles.col}>
          <Card padding={22}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Conocimientos y competencias</h3>
              <Button variant="link" size="sm" onClick={() => setModal({ kind: "skill" })}>
                + Agregar
              </Button>
            </div>
            {technicalSkills.length === 0 ? (
              <p className={styles.completeText}>Aún no has agregado conocimientos ni competencias.</p>
            ) : (
              <div className={styles.chips}>{technicalSkills.map(renderSkillChip)}</div>
            )}
          </Card>

          <Card padding={22}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Habilidades blandas</h3>
              <Button variant="link" size="sm" onClick={() => setModal({ kind: "skill" })}>
                + Agregar
              </Button>
            </div>
            {softSkills.length === 0 ? (
              <p className={styles.completeText}>Aún no has agregado habilidades blandas.</p>
            ) : (
              <div className={styles.chips}>{softSkills.map(renderSkillChip)}</div>
            )}
          </Card>

          <Card padding={22}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Experiencia</h3>
              <Button variant="link" size="sm" onClick={() => setModal({ kind: "experience" })}>
                + Agregar
              </Button>
            </div>
            {collaborator.experiences.length === 0 ? (
              <p className={styles.completeText}>Aún no has agregado experiencia.</p>
            ) : (
              <div className={styles.expList}>
                {collaborator.experiences.map((experience) => (
                  <ExperienceItem
                    key={experience.id}
                    experience={{ title: experience.role, meta: getExperienceMeta(experience) }}
                    onEdit={() => setModal({ kind: "experience", experience })}
                    onDelete={() => void handleDeleteExperience(experience)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className={styles.col}>
          <Card padding={22}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Disponibilidad</h3>
              <Button variant="link" size="sm" onClick={() => setModal({ kind: "availability" })}>
                Editar
              </Button>
            </div>
            <div className={styles.dispList}>
              <div className={styles.dispRow}>
                <span>Estado</span>
                <b className={availability.tone === "green" ? styles.green : undefined}>{availability.label}</b>
              </div>
              <div className={styles.dispRow} data-last="">
                <span>Dedicación semanal</span>
                <b>{collaborator.weeklyHours ? `${collaborator.weeklyHours} horas` : "Sin definir"}</b>
              </div>
            </div>
          </Card>

          <Card padding={22}>
            <h3 className={styles.cardTitle}>Completitud del perfil</h3>
            <p className={styles.completeText}>Un perfil completo mejora tus recomendaciones.</p>
            <div className={styles.barWrap}>
              <div className={styles.bar}>
                <div className={styles.barFill} style={{ width: `${completeness}%` }} />
              </div>
              <span className={styles.barPct}>{completeness}%</span>
            </div>
          </Card>
        </div>
      </div>

      {modal?.kind === "profile" ? (
        <EditProfileModal collaborator={collaborator} onSubmit={updateProfile} onClose={closeModal} />
      ) : null}
      {modal?.kind === "availability" ? (
        <AvailabilityModal collaborator={collaborator} onSubmit={updateAvailability} onClose={closeModal} />
      ) : null}
      {modal?.kind === "skill" ? (
        <SkillModal
          skill={modal.skill}
          onSubmit={(payload) => (modal.skill ? updateSkill(modal.skill.id, payload) : addSkill(payload))}
          onDelete={modal.skill ? () => deleteSkill(modal.skill!.id) : undefined}
          onClose={closeModal}
        />
      ) : null}
      {modal?.kind === "experience" ? (
        <ExperienceModal
          experience={modal.experience}
          onSubmit={(payload) =>
            modal.experience ? updateExperience(modal.experience.id, payload) : addExperience(payload)
          }
          onDelete={modal.experience ? () => deleteExperience(modal.experience!.id) : undefined}
          onClose={closeModal}
        />
      ) : null}
    </AppShell>
  );
}
