"use client";

import { ArrowRight, Check, Code, Database, LayoutGrid, Sparkles, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/templates";
import { Badge, Button } from "@/components/atoms";
import { RequiredProfile, RequiredProfileCard } from "@/components/molecules";
import styles from "./analisis.module.css";

const PROFILES: RequiredProfile[] = [
  {
    icon: Code,
    title: "Desarrollador Frontend",
    count: "1 persona",
    priority: "alta",
    reason: "El módulo de reservas y los dashboards de uso requieren interfaces web claras y responsivas.",
    skills: ["React", "Next.js", "UI responsiva"],
  },
  {
    icon: Database,
    title: "Desarrollador Backend",
    count: "1 persona",
    priority: "alta",
    reason: "La trazabilidad de préstamos e inventario necesita una API robusta y un modelo de datos relacional.",
    skills: ["Node.js", "NestJS", "PostgreSQL"],
  },
  {
    icon: LayoutGrid,
    title: "Diseñador UI/UX",
    count: "1 persona",
    priority: "media",
    reason: "La reserva de laboratorios debe ser intuitiva para docentes y estudiantes con poca experiencia técnica.",
    skills: ["Figma", "Prototipado", "Usabilidad"],
  },
  {
    icon: BarChart3,
    title: "Analista de datos",
    count: "1 persona",
    priority: "media",
    reason: "Los reportes de uso de laboratorios para la coordinación requieren análisis y visualización de datos.",
    skills: ["Análisis de datos", "SQL", "Dashboards"],
  },
];

const breadcrumb = (
  <>
    Proyectos <span className={styles.breadcrumbSep}>/</span> SISGELAB{" "}
    <span className={styles.breadcrumbSep}>/</span>{" "}
    <span className={styles.breadcrumbCurrent}>Análisis de IA</span>
  </>
);

export default function AnalisisPage() {
  return (
    <AppShell breadcrumb={breadcrumb}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>SISGELAB — Sistema de gestión de laboratorios</h1>
          <p className={styles.sub}>Semillero de Software · Registrado el 12 sep 2026</p>
        </div>
        <Badge tone="green">
          <Check size={15} /> Análisis completado
        </Badge>
      </div>

      <div className={styles.banner}>
        <div className={styles.bannerPattern} />
        <span className={styles.bannerIcon}>
          <Sparkles size={28} />
        </span>
        <div className={styles.bannerText}>
          <h3 className={styles.bannerTitle}>La IA identificó 4 perfiles técnicos requeridos</h3>
          <p className={styles.bannerSub}>
            A partir del resumen y los objetivos de tu proyecto. Revisa la justificación de cada uno.
          </p>
        </div>
        <Button variant="white" className={styles.bannerBtn} rightIcon={<ArrowRight size={17} />}>
          Ver colaboradores recomendados
        </Button>
      </div>

      <h3 className={styles.sectionTitle}>Perfiles requeridos</h3>

      <div className={styles.grid}>
        {PROFILES.map((profile) => (
          <RequiredProfileCard key={profile.title} profile={profile} />
        ))}
      </div>
    </AppShell>
  );
}
