"use client";

import { Trash2 } from "lucide-react";
import type { TemplateField, TemplateFieldKind } from "@/apis/interfaces/catalogs";
import { Button, Checkbox, IconButton, Input, Select } from "../../atoms";
import type { ControlSize } from "../../atoms";
import styles from "./TemplateFieldsEditor.module.css";

const KIND_OPTIONS: { value: TemplateFieldKind; label: string }[] = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "select", label: "Lista de opciones" },
  // v2.1 (A6)
  { value: "tags", label: "Palabras clave" },
  { value: "currency", label: "Valor en pesos" },
];

/** Al cambiar de tipo se quitan los ajustes que solo aplican al anterior (el backend los rechaza). */
function withKind(field: TemplateField, kind: TemplateFieldKind): TemplateField {
  const { options, minItems, maxItems, ...base } = field;
  return {
    ...base,
    kind,
    ...(kind === "select" ? { options: options ?? [] } : {}),
    ...(kind === "tags" ? { minItems: minItems ?? 3, maxItems: maxItems ?? 5 } : {}),
  };
}

/** Número de un campo de límites: vacío deja el límite sin definir. */
const limitOf = (text: string) => (text.trim() === "" ? undefined : Number(text));

const EMPTY_FIELD: TemplateField = { key: "", label: "", kind: "text", required: false };

type TemplateFieldsEditorProps = {
  value: TemplateField[];
  onChange: (fields: TemplateField[]) => void;
  size?: ControlSize;
};

/** Editor de la plantilla de campos de un tipo de proyecto (RF7/RF22): uno por fila. */
export function TemplateFieldsEditor({ value, onChange, size }: TemplateFieldsEditorProps) {
  const updateRow = (index: number, patch: Partial<TemplateField>) => {
    onChange(value.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  };

  const addRow = () => onChange([...value, { ...EMPTY_FIELD }]);

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.field} data-size={size}>
      <span className={styles.label}>Campos de la plantilla</span>
      {value.length === 0 ? <p className={styles.empty}>Este tipo no tiene campos propios.</p> : null}
      {value.map((row, index) => (
        <div key={index} className={styles.row}>
          <div className={styles.rowMain}>
            <Input
              placeholder="clave (sin espacios)"
              aria-label={`Clave del campo ${index + 1}`}
              value={row.key}
              onChange={(event) => updateRow(index, { key: event.target.value })}
            />
            <Input
              placeholder="Etiqueta visible"
              aria-label={`Etiqueta del campo ${index + 1}`}
              value={row.label}
              onChange={(event) => updateRow(index, { label: event.target.value })}
            />
            <Select
              aria-label={`Tipo del campo ${index + 1}`}
              options={KIND_OPTIONS}
              value={row.kind}
              onValueChange={(kind) => onChange(value.map((field, i) => (i === index ? withKind(field, kind) : field)))}
            />
            <IconButton
              tone="danger"
              label={`Quitar campo ${index + 1}`}
              icon={<Trash2 />}
              onClick={() => removeRow(index)}
            />
          </div>
          <div className={styles.rowExtra}>
            <Checkbox
              label="Obligatorio"
              checked={row.required}
              onChange={(event) => updateRow(index, { required: event.target.checked })}
            />
            {row.kind === "select" ? (
              <Input
                placeholder="Opciones separadas por coma"
                aria-label={`Opciones del campo ${index + 1}`}
                value={(row.options ?? []).join(", ")}
                onChange={(event) =>
                  updateRow(index, {
                    options: event.target.value
                      .split(",")
                      .map((option) => option.trim())
                      .filter(Boolean),
                  })
                }
              />
            ) : null}
            {row.kind === "tags" ? (
              <div className={styles.limits}>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  label="Mínimo"
                  aria-label={`Mínimo de palabras clave del campo ${index + 1}`}
                  value={row.minItems ?? ""}
                  onChange={(event) => updateRow(index, { minItems: limitOf(event.target.value) })}
                />
                <Input
                  type="number"
                  min={1}
                  max={20}
                  label="Máximo"
                  aria-label={`Máximo de palabras clave del campo ${index + 1}`}
                  value={row.maxItems ?? ""}
                  onChange={(event) => updateRow(index, { maxItems: limitOf(event.target.value) })}
                />
              </div>
            ) : null}
          </div>
        </div>
      ))}
      <Button variant="link" className={styles.add} onClick={addRow}>
        + Agregar campo
      </Button>
    </div>
  );
}
