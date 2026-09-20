"use client";

import { useState } from "react";
import type { AvailabilityStatus, Profile, ProfileExperience, ProfileSkill } from "@/apis/interfaces/profile";
import { AppShell } from "@/components/templates";
import { Badge, BadgeTone, Button, Card, Chip, UserAvatar } from "@/components/atoms";
import { ExperienceItem } from "@/components/molecules";
import { AvailabilityModal, EditProfileModal, ExperienceModal, SkillModal } from "@/components/organisms";
import { useProfile } from "@/modules/profile/hooks/useProfile/useProfile";
import styles from "./perfil.module.css";

const AVAILABILITY_VIEW: Record<AvailabilityStatus, { label: string; tone: BadgeTone }> = {
  DISPONIBLE: { label: "Disponible", tone: "green" },
  PARCIAL: { label: "Parcial", tone: "amber" },
  NO_DISPONIBLE: { label: "No disponible", tone: "gray" },
};

type ModalState =
  | { kind: "profile" }
  | { kind: "availability" }
  | { kind: "skill"; skill?: ProfileSkill }
  | { kind: "experience"; experience?: ProfileExperience }
  | null;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getCompleteness(profile: Profile) {
  const checks = [
    profile.headline,
    profile.studyGroup,
    profile.program,
    profile.weeklyHours,
    profile.modality,
    profile.skills.length > 0,
    profile.experiences.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getExperienceMeta(experience: ProfileExperience) {
  return [experience.organization, experience.period, experience.description].filter(Boolean).join(" · ");
}

export default function PerfilPage() {
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    updateAvailability,
    addSkill,
    updateSkill,
    deleteSkill,
    addExperience,
    updateExperience,
    deleteExperience,
  } = useProfile();
  const [modal, setModal] = useState<ModalState>(null);
  const closeModal = () => setModal(null);

  if (isLoading) {
    return (
      <AppShell>
        <p className={styles.completeText}>Cargando perfil…</p>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <Card padding={24}>
          <p className={styles.completeText}>{error || "No se pudo cargar el perfil."}</p>
          <p className={styles.completeText}>Solo los usuarios con rol Colaborador tienen perfil técnico.</p>
        </Card>
      </AppShell>
    );
  }

  const availability = AVAILABILITY_VIEW[profile.availabilityStatus];
  const meta = [profile.headline, profile.program, profile.studyGroup].filter(Boolean).join(" · ");
  const completeness = getCompleteness(profile);

  return (
    <AppShell>
      <Card padding={24} className={styles.header}>
        <UserAvatar initials={getInitials(profile.fullName)} alt={profile.fullName} size={76} radius={20} />
        <div className={styles.headMain}>
          <div className={styles.headTop}>
            <h1 className={styles.name}>{profile.fullName}</h1>
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
              <button type="button" className={styles.linkBtn} onClick={() => setModal({ kind: "skill" })}>
                + Agregar
              </button>
            </div>
            {profile.skills.length === 0 ? (
              <p className={styles.completeText}>Aún no has agregado conocimientos.</p>
            ) : (
              <div className={styles.chips}>
                {profile.skills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    className={styles.chipBtn}
                    title={`${skill.type === "CONOCIMIENTO" ? "Conocimiento" : "Competencia"}${skill.level ? ` · ${skill.level}` : ""} — clic para editar`}
                    onClick={() => setModal({ kind: "skill", skill })}
                  >
                    <Chip tone={skill.type === "CONOCIMIENTO" ? "neutral" : "red"}>{skill.name}</Chip>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card padding={22}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Experiencia</h3>
              <button type="button" className={styles.linkBtn} onClick={() => setModal({ kind: "experience" })}>
                + Agregar
              </button>
            </div>
            {profile.experiences.length === 0 ? (
              <p className={styles.completeText}>Aún no has agregado experiencia.</p>
            ) : (
              <div className={styles.expList}>
                {profile.experiences.map((experience) => (
                  <ExperienceItem
                    key={experience.id}
                    experience={{ title: experience.title, meta: getExperienceMeta(experience) }}
                    onEdit={() => setModal({ kind: "experience", experience })}
                    onDelete={() => void deleteExperience(experience.id)}
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
              <button type="button" className={styles.linkBtn} onClick={() => setModal({ kind: "availability" })}>
                Editar
              </button>
            </div>
            <div className={styles.dispList}>
              <div className={styles.dispRow}>
                <span>Estado</span>
                <b className={availability.tone === "green" ? styles.green : undefined}>{availability.label}</b>
              </div>
              <div className={styles.dispRow}>
                <span>Dedicación semanal</span>
                <b>{profile.weeklyHours || "Sin definir"}</b>
              </div>
              <div className={styles.dispRow} data-last="">
                <span>Modalidad</span>
                <b>{profile.modality || "Sin definir"}</b>
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
        <EditProfileModal profile={profile} onSubmit={updateProfile} onClose={closeModal} />
      ) : null}
      {modal?.kind === "availability" ? (
        <AvailabilityModal profile={profile} onSubmit={updateAvailability} onClose={closeModal} />
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
          onClose={closeModal}
        />
      ) : null}
    </AppShell>
  );
}
