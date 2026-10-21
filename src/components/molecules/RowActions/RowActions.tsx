import { Eye, Pencil } from "lucide-react";
import { IconButton } from "../../atoms";
import styles from "./RowActions.module.css";

type RowActionsProps = {
  /** Nombre del registro, para las etiquetas accesibles ("Ver Ingeniería de Sistemas"). */
  name: string;
  onView: () => void;
  onEdit: () => void;
  viewTooltip?: string;
  editTooltip?: string;
};

/**
 * Acciones de una fila: ver el detalle completo en modo solo lectura y editar. Las tablas
 * muestran un resumen; "Ver" deja revisar todo sin riesgo de cambiar nada.
 * Los clics no llegan a la fila (que también es clicable con mouse).
 */
export function RowActions({
  name,
  onView,
  onEdit,
  viewTooltip = "Ver detalle",
  editTooltip = "Editar",
}: RowActionsProps) {
  return (
    <div className={styles.actions}>
      <IconButton
        variant="plain"
        size="sm"
        icon={<Eye />}
        label={`Ver ${name}`}
        tooltip={viewTooltip}
        tooltipAlign="end"
        onClick={(event) => {
          event.stopPropagation();
          onView();
        }}
      />
      <IconButton
        variant="plain"
        size="sm"
        icon={<Pencil />}
        label={`Editar ${name}`}
        tooltip={editTooltip}
        tooltipAlign="end"
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
      />
    </div>
  );
}
