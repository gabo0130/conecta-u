import { Trash2 } from "lucide-react";
import type { Deliverable } from "@/apis/interfaces/projects";
import { Button, IconButton, Input } from "../../atoms";

// Igual que la columna `deliverables.name` del backend.
const DELIVERABLE_NAME_MAX_LENGTH = 140;
import type { ControlSize } from "../../atoms";
import styles from "./DeliverablesEditor.module.css";

type DeliverablesEditorProps = {
  value: Deliverable[];
  onChange: (deliverables: Deliverable[]) => void;
  size?: ControlSize;
};

export function DeliverablesEditor({ value, onChange, size }: DeliverablesEditorProps) {
  const updateRow = (index: number, patch: Partial<Deliverable>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => onChange([...value, { name: "", scope: "" }]);

  const removeRow = (index: number) => {
    if (value.length <= 1) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.field} data-size={size}>
      <span className={styles.label}>Entregables (mínimo 1)</span>
      {value.map((row, index) => (
        <div key={index} className={styles.row}>
          <Input
            placeholder="Nombre del entregable"
            aria-label={`Nombre del entregable ${index + 1}`}
            maxLength={DELIVERABLE_NAME_MAX_LENGTH}
            value={row.name}
            onChange={(event) => updateRow(index, { name: event.target.value })}
          />
          <Input
            placeholder="Alcance"
            aria-label={`Alcance del entregable ${index + 1}`}
            value={row.scope}
            onChange={(event) => updateRow(index, { scope: event.target.value })}
          />
          <IconButton
            tone="danger"
            label={`Quitar entregable ${index + 1}`}
            icon={<Trash2 />}
            onClick={() => removeRow(index)}
            disabled={value.length <= 1}
          />
        </div>
      ))}
      <Button variant="link" className={styles.add} onClick={addRow}>
        + Agregar entregable
      </Button>
    </div>
  );
}
