"use client";

import { KeyboardEvent, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/templates";
import { Button, Card, Chip, Input, Select, Textarea } from "@/components/atoms";
import styles from "./nuevo.module.css";

const SEMILLERO_OPTIONS = [
  { value: "software", label: "Semillero de Software" },
  { value: "datos", label: "Semillero de Datos" },
  { value: "investigacion", label: "Semillero de Investigación" },
];

const PROGRAMA_OPTIONS = [
  { value: "sistemas", label: "Ing. de Sistemas" },
  { value: "electronica", label: "Ing. Electrónica" },
  { value: "industrial", label: "Ing. Industrial" },
];

const TIPS = [
  "Sé específico en los objetivos.",
  "Incluye las tecnologías conocidas.",
  "Menciona si es interdisciplinario.",
];

const breadcrumb = (
  <>
    Proyectos <span className={styles.breadcrumbSep}>/</span>{" "}
    <span className={styles.breadcrumbCurrent}>Nuevo proyecto</span>
  </>
);

export default function NuevoProyectoPage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [objectives, setObjectives] = useState("");
  const [skills, setSkills] = useState<string[]>(["Desarrollo web", "Base de datos", "UI/UX"]);
  const [skillDraft, setSkillDraft] = useState("");
  const [semillero, setSemillero] = useState(SEMILLERO_OPTIONS[0].value);
  const [programa, setPrograma] = useState(PROGRAMA_OPTIONS[0].value);

  const addSkill = () => {
    const trimmed = skillDraft.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillDraft("");
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((item) => item !== skill));
  };

  return (
    <AppShell breadcrumb={breadcrumb}>
      <div className={styles.layout}>
        <div className={styles.formCol}>
          <h1 className={styles.h1}>Registrar proyecto de investigación</h1>
          <p className={styles.sub}>
            Completa la plantilla. La IA usará esta información para identificar los perfiles requeridos.
          </p>

          <Card padding={24} className={styles.formCard}>
            <Input
              label="Título del proyecto"
              placeholder="Nombre del proyecto"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Textarea
              label="Resumen"
              rows={3}
              placeholder="Describe brevemente el proyecto"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />

            <Textarea
              label="Objetivos"
              rows={3}
              placeholder="¿Qué busca lograr el proyecto?"
              value={objectives}
              onChange={(event) => setObjectives(event.target.value)}
            />

            <div className={styles.field}>
              <label className={styles.label}>Habilidades técnicas conocidas</label>
              <div className={styles.chipsInput}>
                {skills.map((skill) => (
                  <Chip key={skill} tone="red">
                    {skill}
                    <button
                      type="button"
                      className={styles.removeSkill}
                      onClick={() => removeSkill(skill)}
                      aria-label={`Quitar ${skill}`}
                    >
                      ×
                    </button>
                  </Chip>
                ))}
                <input
                  className={styles.skillInput}
                  value={skillDraft}
                  onChange={(event) => setSkillDraft(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  placeholder="Escribe y presiona Enter…"
                />
              </div>
            </div>

            <div className={styles.row}>
              <Select
                label="Semillero"
                options={SEMILLERO_OPTIONS}
                value={semillero}
                onChange={(event) => setSemillero(event.target.value)}
              />
              <Select
                label="Programa"
                options={PROGRAMA_OPTIONS}
                value={programa}
                onChange={(event) => setPrograma(event.target.value)}
              />
            </div>
          </Card>

          <div className={styles.actions}>
            <Button variant="ghost">Guardar borrador</Button>
            <Button leftIcon={<Sparkles size={18} />}>Guardar y analizar con IA</Button>
          </div>
        </div>

        <aside className={styles.helper}>
          <Card padding={22} className={styles.iaCard}>
            <div className={styles.iaHead}>
              <Sparkles size={22} />
              <h3 className={styles.iaTitle}>¿Cómo funciona la IA?</h3>
            </div>
            <p className={styles.iaText}>
              Al guardar, la IA analiza el resumen y los objetivos para sugerir los perfiles técnicos que tu
              proyecto necesita, con una justificación de cada uno.
            </p>
            <p className={styles.iaText}>
              Luego cruza esos perfiles con los colaboradores registrados y te recomienda personas por afinidad.
            </p>
          </Card>

          <Card padding={20}>
            <h4 className={styles.tipsTitle}>Consejos</h4>
            <div className={styles.tips}>
              {TIPS.map((tip) => (
                <div key={tip} className={styles.tip}>
                  <Check size={17} className={styles.tipIcon} />
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
