import { DashboardSectionShell } from "./DashboardSectionShell";

type ExampleSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ExampleSection({ eyebrow, title, description }: ExampleSectionProps) {
  return (
    <DashboardSectionShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      metrics={[
        { label: "Métrica 1", value: "0", detail: "Descripción breve" },
        { label: "Métrica 2", value: "0", detail: "Descripción breve" },
        { label: "Métrica 3", value: "0", detail: "Descripción breve" },
      ]}
      cards={[
        {
          tag: "Ejemplo",
          title: "Tarjeta de ejemplo",
          description: "Reemplaza este contenido con la información real de tu sección.",
        },
      ]}
    />
  );
}
