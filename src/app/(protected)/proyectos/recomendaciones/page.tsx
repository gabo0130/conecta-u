"use client";

import { useState } from "react";
import { AppShell } from "@/components/templates";
import { CollaboratorRecommendation, RecommendationCard } from "@/components/organisms";
import styles from "./recomendaciones.module.css";

const FILTERS = ["Todos los perfiles", "Frontend", "Backend", "UI/UX", "Datos"];

const PEOPLE: CollaboratorRecommendation[] = [
  {
    initials: "CC",
    name: "Carlos Contreras",
    role: "Frontend",
    availability: { label: "Disponible", tone: "green" },
    meta: "Ing. de Sistemas · Semillero de Software",
    affinityScore: 94,
    reasonPrefix: "Coincide en ",
    reasonHighlight: "React, Next.js y UI responsiva",
    reasonSuffix: ", justo lo requerido para el módulo de reservas y dashboards.",
    matchedSkills: ["React", "Next.js"],
    otherSkills: ["TypeScript", "Figma"],
  },
  {
    initials: "MR",
    name: "María Rangel",
    role: "Backend",
    availability: { label: "Disponible", tone: "green" },
    meta: "Ing. de Sistemas · Semillero de Datos",
    affinityScore: 89,
    reasonPrefix: "Fuerte en ",
    reasonHighlight: "NestJS y PostgreSQL",
    reasonSuffix: ", pertinente para la API e inventario con trazabilidad.",
    matchedSkills: ["NestJS", "PostgreSQL"],
    otherSkills: ["Node.js", "Docker"],
  },
  {
    initials: "DL",
    name: "Diego Luna",
    role: "UI/UX",
    availability: { label: "Parcial", tone: "amber" },
    meta: "Diseño Gráfico · Semillero de Innovación",
    affinityScore: 82,
    reasonPrefix: "Aporta ",
    reasonHighlight: "prototipado y usabilidad",
    reasonSuffix: " en Figma para que la reserva sea intuitiva para docentes.",
    matchedSkills: ["Figma", "Usabilidad"],
    otherSkills: ["Prototipado"],
  },
  {
    initials: "SA",
    name: "Sara Ayala",
    role: "Datos",
    availability: { label: "Disponible", tone: "green" },
    meta: "Estadística · Semillero de Datos",
    affinityScore: 78,
    reasonPrefix: "Coincide en ",
    reasonHighlight: "análisis de datos y SQL",
    reasonSuffix: " para los reportes de uso que pide la coordinación.",
    matchedSkills: ["Análisis de datos", "SQL"],
    otherSkills: ["Power BI"],
  },
];

const breadcrumb = (
  <>
    SISGELAB <span className={styles.breadcrumbSep}>/</span>{" "}
    <span className={styles.breadcrumbCurrent}>Colaboradores recomendados</span>
  </>
);

export default function RecomendacionesPage() {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);

  return (
    <AppShell breadcrumb={breadcrumb}>
      <div>
        <h1 className={styles.h1}>Colaboradores recomendados</h1>
        <p className={styles.sub}>
          Personas cuyo perfil coincide con los requeridos por <b>SISGELAB</b>. Las recomendaciones son un
          apoyo: tú decides a quién convocar.
        </p>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((filter) => {
          const filterClassName = [styles.filter, filter === activeFilter ? styles.filterOn : ""]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={filter}
              type="button"
              className={filterClassName}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          );
        })}
        <span className={styles.count}>{PEOPLE.length} coincidencias · ordenadas por afinidad</span>
      </div>

      <div className={styles.list}>
        {PEOPLE.map((person) => (
          <RecommendationCard key={person.name} collaborator={person} />
        ))}
      </div>
    </AppShell>
  );
}
