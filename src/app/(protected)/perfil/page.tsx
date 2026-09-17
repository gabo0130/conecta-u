"use client";

import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/templates";
import { Badge, Button, Card, Chip, UserAvatar } from "@/components/atoms";
import { Experience, ExperienceItem } from "@/components/molecules";
import styles from "./perfil.module.css";

const SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "TypeScript",
  "Diseño UI/UX",
  "Figma",
  "Análisis de datos",
  "Git",
];

const EXPERIENCE: Experience[] = [
  {
    title: "Desarrollador Frontend — Semillero de Software",
    meta: "2024 – actual · React, Next.js. Módulos de gestión y dashboards.",
  },
  {
    title: "Proyecto de aula — API REST con NestJS",
    meta: "2023 · Backend, PostgreSQL, autenticación por roles.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function PerfilPage() {
  const { user } = useAuth();
  const name = user?.fullName ?? "";

  return (
    <AppShell>
      <Card padding={24} className={styles.header}>
        <UserAvatar initials={getInitials(name)} alt={name} size={76} radius={20} />
        <div className={styles.headMain}>
          <div className={styles.headTop}>
            <h1 className={styles.name}>{name}</h1>
            <Badge tone="green" dot>
              Disponible
            </Badge>
          </div>
          <div className={styles.meta}>Estudiante · Ingeniería de Sistemas · Semillero de Software</div>
        </div>
        <Button variant="ghost">Editar perfil</Button>
      </Card>

      <div className={styles.grid}>
        <div className={styles.col}>
          <Card padding={22}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Conocimientos y competencias</h3>
              <a href="#">+ Agregar</a>
            </div>
            <div className={styles.chips}>
              {SKILLS.map((skill) => (
                <Chip key={skill}>{skill}</Chip>
              ))}
            </div>
          </Card>

          <Card padding={22}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Experiencia</h3>
              <a href="#">+ Agregar</a>
            </div>
            <div className={styles.expList}>
              {EXPERIENCE.map((experience) => (
                <ExperienceItem key={experience.title} experience={experience} />
              ))}
            </div>
          </Card>
        </div>

        <div className={styles.col}>
          <Card padding={22}>
            <h3 className={styles.cardTitle}>Disponibilidad</h3>
            <div className={styles.dispList}>
              <div className={styles.dispRow}>
                <span>Estado</span>
                <b className={styles.green}>Disponible</b>
              </div>
              <div className={styles.dispRow}>
                <span>Dedicación semanal</span>
                <b>10–15 horas</b>
              </div>
              <div className={styles.dispRow} data-last="">
                <span>Modalidad</span>
                <b>Presencial / Remoto</b>
              </div>
            </div>
          </Card>

          <Card padding={22}>
            <h3 className={styles.cardTitle}>Completitud del perfil</h3>
            <p className={styles.completeText}>Un perfil completo mejora tus recomendaciones.</p>
            <div className={styles.barWrap}>
              <div className={styles.bar}>
                <div className={styles.barFill} style={{ width: "85%" }} />
              </div>
              <span className={styles.barPct}>85%</span>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
