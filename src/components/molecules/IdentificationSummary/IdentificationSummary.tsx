import { AlertTriangle, Pencil } from "lucide-react";
import type { Identification } from "@/apis/interfaces/collaborator";
import { DOCUMENT_TYPE_LABEL } from "@/modules/collaborator/utils/identification";
import { Button, Card } from "../../atoms";
import styles from "./IdentificationSummary.module.css";

type IdentificationSummaryProps = {
  person: Identification;
  /** Sin `onEdit` es de solo lectura. */
  onEdit?: () => void;
  /** Texto del aviso cuando faltan datos (cambia si lo ve la persona o el ADMIN). */
  incompleteMessage?: string;
};

/**
 * Identificación y contacto de una persona (v2.1). Solo la ven la propia persona y el ADMIN:
 * nunca se usa en vistas del líder ni en recomendaciones (RNF5, Ley 1581).
 */
export function IdentificationSummary({
  person,
  onEdit,
  incompleteMessage = "Faltan el documento o el teléfono.",
}: IdentificationSummaryProps) {
  const document =
    person.documentType && person.documentNumber
      ? `${DOCUMENT_TYPE_LABEL[person.documentType]} · ${person.documentNumber}`
      : null;
  const rows: [string, string | null][] = [
    ["Documento", document],
    ["Teléfono", person.phone],
    ["Nacionalidad", person.nationality],
    ["Correo alterno", person.alternateEmail],
    ["Código institucional", person.institutionalCode],
  ];

  return (
    <Card padding={22}>
      <div className={styles.head}>
        <h3 className={styles.title}>Identificación y contacto</h3>
        {onEdit ? (
          <Button variant="link" size="sm" leftIcon={<Pencil size={15} />} onClick={onEdit}>
            {person.identificationComplete ? "Editar" : "Completar"}
          </Button>
        ) : null}
      </div>
      {!person.identificationComplete ? (
        <p className={styles.warning} role="status">
          <AlertTriangle size={16} aria-hidden />
          {incompleteMessage}
        </p>
      ) : null}
      <dl className={styles.list}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd className={value ? undefined : styles.empty}>{value ?? "Sin definir"}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
