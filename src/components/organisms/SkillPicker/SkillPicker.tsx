"use client";

import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Skill, SkillType } from "@/apis/interfaces/catalogs";
import { useSkillsCatalog } from "@/modules/catalogs/hooks/useSkillsCatalog/useSkillsCatalog";
import { Chip, Spinner } from "../../atoms";
import type { ChipTone, ControlSize } from "../../atoms";
import { getErrorMessage } from "@/utils/get-error-message";
import { notify } from "@/utils/notify";
import { SKILL_CATEGORY_LABEL, SKILL_TYPE_OPTIONS, SKILL_TYPE_TONE } from "./skill-type";
import styles from "./SkillPicker.module.css";

export type SkillRef = { id: string; name: string };

/** Las opciones que trae `useSkillsCatalog` siempre son `Skill` completos; los ya seleccionados
 * (`value`) pueden ser algo más recortado (p. ej. `ExperienceTechnology`, sin `type`). */
function getSkillTone(skill: SkillRef & { type?: SkillType }): ChipTone {
  return skill.type ? SKILL_TYPE_TONE[skill.type] : "neutral";
}

type SkillPickerProps<T extends SkillRef> = {
  label?: string;
  mode?: "single" | "multi";
  value: T[];
  /** Las habilidades elegidas en el buscador llegan como `Skill` completos junto a las que ya estaban. */
  onChange: (skills: (T | Skill)[]) => void;
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
  placeholder = "Buscar habilidad…",
  size,
}: SkillPickerProps<T>) {
  const { skills, resultsQuery, failedQuery, isLoading, error: searchError, search, proposeSkill } = useSkillsCatalog();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  // Tipo elegido para una habilidad que aún no existe en el catálogo; solo importa al proponerla.
  const [proposeTypeChoice, setProposeTypeChoice] = useState<SkillType>(
    proposeType ?? typeFilter ?? "CONOCIMIENTO",
  );
  const containerRef = useRef<HTMLDivElement>(null);
  // Opción resaltada con las flechas (patrón combobox de WAI-ARIA); -1 = ninguna.
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputId = useId();
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-opcion-${index}`;

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
      if (containerRef.current && event.target instanceof Node && !containerRef.current.contains(event.target)) {
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
  // reemplazaran por "Buscando…", la lista se encogería y crecería con cada tecla.
  const isUpToDate = resultsQuery === query.trim();
  const searchFailed = !isUpToDate && !isLoading && failedQuery === query.trim();
  const exactMatch =
    results.some((skill) => skill.name.trim().toLowerCase() === normalizedQuery) ||
    value.some((skill) => skill.name.trim().toLowerCase() === normalizedQuery);

  const isListOpen = isOpen && query.trim().length >= 2;
  const active = activeIndex < results.length ? activeIndex : -1;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      if (results.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const from = current < results.length ? current : -1;
        return Math.min(Math.max(from + step, 0), results.length - 1);
      });
    } else if (event.key === "Enter") {
      // Enter elige la opción resaltada y nunca envía el formulario del modal.
      event.preventDefault();
      if (isListOpen && active >= 0) selectSkill(results[active]);
    } else if (event.key === "Escape" && isListOpen) {
      // Escape cierra solo la lista; sin stopPropagation también cerraría el modal que la contiene.
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  const selectSkill = (skill: Skill) => {
    onChange(mode === "single" ? [skill] : [...value, skill]);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
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
      {label ? (
        showInput ? (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        ) : (
          <span className={styles.label}>{label}</span>
        )
      ) : null}
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
            id={inputId}
            className={styles.input}
            placeholder={placeholder}
            value={query}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isListOpen}
            aria-controls={listboxId}
            aria-activedescendant={isListOpen && active >= 0 ? optionId(active) : undefined}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {isListOpen ? (
            <div className={styles.dropdown}>
              <ul id={listboxId} role="listbox" aria-label={label ?? "Habilidades"} className={styles.listbox}>
                {results.map((skill, index) => (
                  <li
                    key={skill.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    className={[styles.option, index === active ? styles.optionActive : ""].filter(Boolean).join(" ")}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectSkill(skill)}
                  >
                    {skill.name}
                    <span className={styles.optionMeta}>{SKILL_CATEGORY_LABEL[skill.category] ?? skill.category}</span>
                  </li>
                ))}
              </ul>
              {searchFailed ? (
                <div className={`${styles.hint} ${styles.failed}`} role="alert">
                  <span>{searchError}</span>
                  <button
                    type="button"
                    className={styles.retry}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => void search(query.trim(), typeFilter)}
                  >
                    Reintentar
                  </button>
                </div>
              ) : null}
              {!isUpToDate && !searchFailed && results.length === 0 ? (
                <div className={`${styles.hint} ${styles.searching}`} role="status">
                  <Spinner size="sm" label="" />
                  Buscando…
                </div>
              ) : null}
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
                        onChange={(event) => {
                          const option = SKILL_TYPE_OPTIONS.find((candidate) => candidate.value === event.target.value);
                          if (option) setProposeTypeChoice(option.value);
                        }}
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
                      {isProposing ? "Proponiendo…" : `+ Proponer "${query.trim()}"`}
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
