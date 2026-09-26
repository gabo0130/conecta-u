"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Skill, SkillType } from "@/apis/interfaces/catalogs";
import { useSkillsCatalog } from "@/modules/catalogs/hooks/useSkillsCatalog/useSkillsCatalog";
import { Chip } from "../../atoms";
import type { ChipTone, ControlSize } from "../../atoms";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { SKILL_TYPE_OPTIONS, SKILL_TYPE_TONE } from "./skill-type";
import styles from "./SkillPicker.module.css";

export type SkillRef = { id: string; name: string };

/** Las opciones que trae `useSkillsCatalog` siempre son `Skill` completos; los ya seleccionados
 * (`value`) pueden ser algo más recortado (p. ej. `ExperienceTechnology`, sin `type`). */
function getSkillTone(skill: SkillRef): ChipTone {
  const type = (skill as Partial<Skill>).type;
  return type ? SKILL_TYPE_TONE[type] : "neutral";
}

type SkillPickerProps<T extends SkillRef> = {
  label?: string;
  mode?: "single" | "multi";
  value: T[];
  onChange: (skills: T[]) => void;
  typeFilter?: SkillType;
  proposeType?: SkillType;
  disabled?: boolean;
  placeholder?: string;
  size?: ControlSize;
};

export function SkillPicker<T extends SkillRef = Skill>({
  label,
  mode = "multi",
  value,
  onChange,
  typeFilter,
  proposeType,
  disabled = false,
  placeholder = "Buscar habilidad...",
  size,
}: SkillPickerProps<T>) {
  const { skills, resultsQuery, isLoading, search, proposeSkill } = useSkillsCatalog();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  // Tipo elegido para una habilidad que aún no existe en el catálogo; solo importa al proponerla.
  const [proposeTypeChoice, setProposeTypeChoice] = useState<SkillType>(
    proposeType ?? typeFilter ?? "CONOCIMIENTO",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timeout = setTimeout(() => {
      void search(query.trim(), typeFilter);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, typeFilter, search]);

  // Cierra el dropdown solo con un clic fuera del control, no al perder el foco: el selector de
  // tipo (nativo) y los botones internos mueven el foco sin que el usuario "salga" del picker.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedIds = new Set(value.map((skill) => skill.id));
  const results = skills.filter((skill) => !selectedIds.has(skill.id));
  const normalizedQuery = query.trim().toLowerCase();
  // Mientras llega la búsqueda nueva se siguen mostrando los resultados anteriores: si se
  // reemplazaran por "Buscando...", la lista se encogería y crecería con cada tecla.
  const isUpToDate = resultsQuery === query.trim();
  const exactMatch =
    results.some((skill) => skill.name.trim().toLowerCase() === normalizedQuery) ||
    value.some((skill) => skill.name.trim().toLowerCase() === normalizedQuery);

  const selectSkill = (skill: Skill) => {
    const asValue = skill as unknown as T;
    onChange(mode === "single" ? [asValue] : [...value, asValue]);
    setQuery("");
    setIsOpen(false);
  };

  const removeSkill = (id: string) => {
    onChange(value.filter((skill) => skill.id !== id));
  };

  const handlePropose = async () => {
    const name = query.trim();
    if (!name) return;
    setIsProposing(true);
    try {
      const skill = await proposeSkill({ name, type: proposeTypeChoice });
      selectSkill(skill);
      void notify.info(
        `"${skill.name}" se agregó como habilidad nueva. Quedará pendiente hasta que un administrador la revise, pero ya puedes usarla.`,
        { title: "Habilidad propuesta" },
      );
    } catch (err) {
      void notify.error(getErrorMessage(err, "No se pudo proponer la habilidad. Intenta nuevamente."));
    } finally {
      setIsProposing(false);
    }
  };

  const showInput = !disabled && (mode === "multi" || value.length === 0);

  return (
    <div className={styles.field} data-size={size}>
      {label ? <span className={styles.label}>{label}</span> : null}
      {value.length > 0 ? (
        <div className={styles.chips}>
          {value.map((skill) => (
            <Chip key={skill.id} tone={getSkillTone(skill)} className={styles.chip}>
              {skill.name}
              {!disabled ? (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeSkill(skill.id)}
                  aria-label={`Quitar ${skill.name}`}
                >
                  <X />
                </button>
              ) : null}
            </Chip>
          ))}
        </div>
      ) : null}
      {showInput ? (
        <div className={styles.control} ref={containerRef}>
          <input
            className={styles.input}
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {isOpen && query.trim().length >= 2 ? (
            <div className={styles.dropdown}>
              {results.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  className={styles.option}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSkill(skill)}
                >
                  {skill.name}
                  <span className={styles.optionMeta}>{skill.category}</span>
                </button>
              ))}
              {!isUpToDate && results.length === 0 ? <div className={styles.hint}>Buscando...</div> : null}
              {isUpToDate && results.length === 0 && exactMatch ? (
                <div className={styles.hint}>Ya está en la lista.</div>
              ) : null}
              {isUpToDate && !isLoading && !exactMatch ? (
                <div className={styles.proposePanel}>
                  <p className={styles.proposeHint}>¿No existe todavía? Proponla como nueva habilidad:</p>
                  <div className={styles.proposeControls}>
                    {!typeFilter && !proposeType ? (
                      <select
                        className={styles.proposeType}
                        value={proposeTypeChoice}
                        onChange={(event) => setProposeTypeChoice(event.target.value as SkillType)}
                        aria-label="Tipo de la nueva habilidad"
                      >
                        {SKILL_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <button
                      type="button"
                      className={styles.propose}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void handlePropose()}
                      disabled={isProposing}
                    >
                      {isProposing ? "Proponiendo..." : `+ Proponer "${query.trim()}"`}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
