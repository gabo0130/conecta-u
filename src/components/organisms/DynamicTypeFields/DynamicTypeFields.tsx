import type { TemplateField } from "@/apis/interfaces/catalogs";
import { formatCOP, tagsOf, tagsRangeText } from "@/modules/projects/utils/type-data";
import { Input, Select, Textarea } from "../../atoms";
import { TagsInput } from "../../molecules";
import type { ControlSize } from "../../atoms";
import styles from "./DynamicTypeFields.module.css";

type DynamicTypeFieldsProps = {
  templateFields: TemplateField[];
  typeData: Record<string, unknown>;
  onChange: (typeData: Record<string, unknown>) => void;
  size?: ControlSize;
};

export function DynamicTypeFields({ templateFields, typeData, onChange, size }: DynamicTypeFieldsProps) {
  if (templateFields.length === 0) return null;

  const setField = (key: string, value: unknown) => {
    onChange({ ...typeData, [key]: value });
  };

  return (
    <div className={styles.fields} data-size={size}>
      {templateFields.map((field) => {
        const value = typeData[field.key];
        const label = field.required ? `${field.label} *` : `${field.label} (opcional)`;

        if (field.kind === "textarea") {
          return (
            <Textarea
              key={field.key}
              label={label}
              rows={3}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => setField(field.key, event.target.value)}
            />
          );
        }

        if (field.kind === "select") {
          return (
            <Select
              key={field.key}
              label={label}
              options={[
                { value: "", label: "Selecciona una opción" },
                ...(field.options ?? []).map((option) => ({ value: option, label: option })),
              ]}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => setField(field.key, event.target.value)}
            />
          );
        }

        if (field.kind === "number") {
          return (
            <Input
              key={field.key}
              label={label}
              type="number"
              value={typeof value === "number" ? value : (value as string) ?? ""}
              onChange={(event) => setField(field.key, event.target.value === "" ? "" : Number(event.target.value))}
            />
          );
        }

        // v2.1 (A6): palabras clave y valor en pesos.
        if (field.kind === "tags") {
          return (
            <TagsInput
              key={field.key}
              label={label}
              value={tagsOf(value)}
              onChange={(tags) => setField(field.key, tags)}
              max={field.maxItems}
              helperText={`Escribe ${tagsRangeText(field)} palabras clave; Enter para agregar cada una.`}
            />
          );
        }

        if (field.kind === "currency") {
          return (
            <Input
              key={field.key}
              label={label}
              inputMode="numeric"
              placeholder="$ 0"
              value={typeof value === "number" ? formatCOP(value) : ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "");
                setField(field.key, digits ? Number(digits) : "");
              }}
              helperText="Pesos colombianos (COP), sin centavos."
            />
          );
        }

        if (field.kind === "date") {
          return (
            <Input
              key={field.key}
              label={label}
              type="date"
              value={typeof value === "string" ? value : ""}
              onChange={(event) => setField(field.key, event.target.value)}
            />
          );
        }

        return (
          <Input
            key={field.key}
            label={label}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => setField(field.key, event.target.value)}
          />
        );
      })}
    </div>
  );
}
