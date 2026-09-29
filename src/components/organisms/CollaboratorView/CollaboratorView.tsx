import Link from "next/link";
import type { AdminCollaboratorDetail } from "@/apis/interfaces/admin";
import {
  AVAILABILITY_VIEW,
  EXPERIENCE_TYPE_LABEL,
  LEVEL_LABEL,
  PERSON_TYPE_LABEL,
  ROLE_LABEL,
  SOURCE_LABEL,
  getExperienceMeta,
} from "@/modules/collaborator/utils/collaborator-view";
import { formatDate, getStatusView } from "@/modules/projects/utils/project-view";
import { Badge, Card, Chip, Spinner } from "../../atoms";
import { SKILL_TYPE_LABEL, SKILL_TYPE_TONE, groupBySoftSkill } from "../SkillPicker/skill-type";
import styles from "./CollaboratorView.module.css";

type CollaboratorViewProps = {
  collaborator: AdminCollaboratorDetail;
  programName?: string;
  /** El catálogo de programas todavía está cargando. */
  isProgramLoading?: boolean;
};

const EMPTY = "Sin definir";

/** Perfil técnico de una persona en solo lectura, con los datos de cuenta y registro que ve el ADMIN. */
export function CollaboratorView({ collaborator, programName, isProgramLoading = false }: CollaboratorViewProps) {
  const availability = AVAILABILITY_VIEW[collaborator.availabilityStatus];
  const { user } = collaborator;
  const { technical: technicalSkills, soft: softSkills } = groupBySoftSkill(
    collaborator.skills,
    (entry) => entry.skill.type,
  );
  const renderSkillRow = (entry: (typeof collaborator.skills)[number]) => (
    <li key={entry.id} className={styles.skillRow}>
      <Chip tone={SKILL_TYPE_TONE[entry.skill.type]} title={SKILL_TYPE_LABEL[entry.skill.type]}>
        {entry.skill.name}
      </Chip>
      <span className={styles.rowMeta}>
        {LEVEL_LABEL[entry.level]} · {entry.experienceMonths} meses
        {entry.lastUsedYear ? ` · último uso ${entry.lastUsedYear}` : ""}
      </span>
    </li>
  );

  return (
    // Móvil: una columna (datos → cuenta → disponibilidad → habilidades → experiencia → proyectos → registro).
    // xl: principal (datos, habilidades, experiencia) + lateral (cuenta, disponibilidad, proyectos, registro).
    <div className={styles.view}>
      <div className={styles.primary}>
        <Card padding={24} className={styles.o1}>
          <h2 className={styles.sectionTitle}>Datos del perfil</h2>
          {collaborator.summary ? <p className={styles.text}>{collaborator.summary}</p> : null}
          <dl className={styles.fields}>
            <div className={styles.field}>
              <dt>Correo</dt>
              <dd>{collaborator.email}</dd>
            </div>
            <div className={styles.field}>
              <dt>Tipo de persona</dt>
              <dd>{PERSON_TYPE_LABEL[collaborator.personType]}</dd>
            </div>
            <div className={styles.field}>
              <dt>Programa</dt>
              <dd>{isProgramLoading ? <Spinner size="sm" label="Cargando programa" /> : (programName ?? EMPTY)}</dd>
            </div>
            <div className={styles.field}>
              <dt>Semestre</dt>
              <dd>{collaborator.semester ?? "No aplica"}</dd>
            </div>
            <div className={styles.field}>
              <dt>Semillero o grupo</dt>
              <dd>{collaborator.researchGroup ?? EMPTY}</dd>
            </div>
            <div className={styles.field}>
              <dt>Enlace</dt>
              <dd>
                {collaborator.profileUrl ? (
                  <a href={collaborator.profileUrl} target="_blank" rel="noreferrer noopener">
                    {collaborator.profileUrl}
                  </a>
                ) : (
                  EMPTY
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card padding={24} className={styles.o4}>
          <h2 className={styles.sectionTitle}>Conocimientos y competencias ({technicalSkills.length})</h2>
          {technicalSkills.length > 0 ? (
            <ul className={styles.rows}>{technicalSkills.map(renderSkillRow)}</ul>
          ) : (
            <p className={styles.empty}>Aún no registró conocimientos ni competencias.</p>
          )}
        </Card>

        <Card padding={24} className={styles.o4}>
          <h2 className={styles.sectionTitle}>Habilidades blandas ({softSkills.length})</h2>
          {softSkills.length > 0 ? (
            <ul className={styles.rows}>{softSkills.map(renderSkillRow)}</ul>
          ) : (
            <p className={styles.empty}>Aún no registró habilidades blandas.</p>
          )}
        </Card>

        <Card padding={24} className={styles.o5}>
          <h2 className={styles.sectionTitle}>Experiencia ({collaborator.experiences.length})</h2>
          {collaborator.experiences.length > 0 ? (
            <ul className={styles.rows}>
              {collaborator.experiences.map((experience) => (
                <li key={experience.id} className={styles.experience}>
                  <p className={styles.expTitle}>
                    {experience.role} <span className={styles.expType}>· {EXPERIENCE_TYPE_LABEL[experience.type]}</span>
                  </p>
                  <p className={styles.rowMeta}>{getExperienceMeta(experience)}</p>
                  <p className={styles.rowMeta}>
                    Nivel {LEVEL_LABEL[experience.level].toLowerCase()} · {experience.weeklyHours} h/semana
                  </p>
                  {experience.technologies.length > 0 ? (
                    <div className={styles.chips}>
                      {experience.technologies.map((technology) => (
                        <Chip key={technology.id}>{technology.name}</Chip>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Aún no registró experiencia.</p>
          )}
        </Card>
      </div>

      <div className={styles.secondary}>
        <Card padding={20} className={styles.o2}>
          <h2 className={styles.sectionTitle}>Cuenta de usuario</h2>
          {user ? (
            <dl className={styles.stack}>
              <div className={styles.field}>
                <dt>Nombre</dt>
                <dd>{user.fullName}</dd>
              </div>
              <div className={styles.field}>
                <dt>Rol</dt>
                <dd>{ROLE_LABEL[user.role]}</dd>
              </div>
              <div className={styles.field}>
                <dt>Estado</dt>
                <dd>
                  <Badge tone={user.active ? "green" : "gray"} dot>
                    {user.active ? "Activa" : "Inactiva"}
                  </Badge>
                </dd>
              </div>
            </dl>
          ) : (
            <p className={styles.empty}>
              Sin usuario. Esta persona entra en las recomendaciones y se le puede convocar por correo, pero no inicia
              sesión.
            </p>
          )}
        </Card>

        <Card padding={20} className={styles.o3}>
          <h2 className={styles.sectionTitle}>Disponibilidad</h2>
          <div className={styles.availability}>
            <Badge tone={availability.tone}>{availability.label}</Badge>
            <span className={styles.rowMeta}>
              {collaborator.weeklyHours ? `${collaborator.weeklyHours} horas por semana` : "Horas sin definir"}
            </span>
          </div>
        </Card>

        {user?.role === "LIDER" || collaborator.ledProjects.length > 0 ? (
          <Card padding={20} className={styles.o6}>
            <h2 className={styles.sectionTitle}>Proyectos que lidera ({collaborator.ledProjects.length})</h2>
            {collaborator.ledProjects.length > 0 ? (
              <ul className={styles.rows}>
                {collaborator.ledProjects.map((project) => {
                  const status = getStatusView(project.status);
                  return (
                    <li key={project.id} className={styles.projectRow}>
                      <Link href={`/proyectos/${project.id}`} className={styles.projectLink}>
                        {project.title}
                      </Link>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.empty}>Aún no registró proyectos.</p>
            )}
          </Card>
        ) : null}

        <Card padding={20} className={styles.o7}>
          <h2 className={styles.sectionTitle}>Registro</h2>
          <dl className={styles.stack}>
            <div className={styles.field}>
              <dt>Origen</dt>
              <dd>{SOURCE_LABEL[collaborator.source]}</dd>
            </div>
            <div className={styles.field}>
              <dt>Perfil</dt>
              <dd>
                <Badge tone={collaborator.active ? "green" : "gray"} dot>
                  {collaborator.active ? "Activo" : "Dado de baja"}
                </Badge>
              </dd>
            </div>
            <div className={styles.field}>
              <dt>Autorización de datos (Ley 1581)</dt>
              <dd>
                {collaborator.dataConsent
                  ? `Sí${collaborator.dataConsentAt ? `, el ${formatDate(collaborator.dataConsentAt)}` : ""}`
                  : "No"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
