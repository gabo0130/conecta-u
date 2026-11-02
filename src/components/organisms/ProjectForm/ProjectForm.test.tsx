import { fireEvent, render, screen } from "@testing-library/react";
import { ProjectForm } from "./ProjectForm";

jest.mock("@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog", () => ({
  useProjectTypesCatalog: () => ({
    projectTypes: [{ id: "type-1", name: "Investigación", templateFields: [] }],
    isLoading: false,
    error: "",
  }),
}));
jest.mock("@/modules/catalogs/hooks/useProjectCategoriesCatalog/useProjectCategoriesCatalog", () => ({
  useProjectCategoriesCatalog: () => ({
    projectCategories: [{ id: "category-1", name: "Ambiental" }],
    isLoading: false,
    error: "",
  }),
}));
jest.mock("@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog", () => ({
  useProgramsCatalog: () => ({ programs: [], isLoading: false, error: "" }),
}));
jest.mock("@/modules/catalogs/hooks/useSkillsCatalog/useSkillsCatalog", () => ({
  useSkillsCatalog: () => ({
    skills: [],
    resultsQuery: null,
    failedQuery: null,
    isLoading: false,
    error: "",
    search: jest.fn(),
    proposeSkill: jest.fn(),
  }),
}));

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label.replace(/[()]/g, "\\$&")}`));
const type = (label: string, value: string) => fireEvent.change(field(label), { target: { value } });

function renderForm() {
  const onSubmit = jest.fn();
  render(<ProjectForm submitLabel="Registrar proyecto" isSaving={false} onSubmit={onSubmit} onCancel={jest.fn()} />);
  type("Título del proyecto", "Monitoreo del agua");
  type("Resumen", "Sensores en el río Pamplonita");
  type("Objetivos", "Medir la calidad del agua");
  fireEvent.change(screen.getByLabelText("Nombre del entregable 1"), { target: { value: "Prototipo" } });
  fireEvent.change(screen.getByLabelText("Alcance del entregable 1"), { target: { value: "Primer sensor" } });
  return onSubmit;
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: "Registrar proyecto" }));

describe("ProjectForm: entidades y duración (v2.2, E5)", () => {
  it("pide la entidad ejecutora y la duración al registrar", () => {
    const onSubmit = renderForm();

    submit();
    expect(screen.getByText("Indica la entidad ejecutora del proyecto.")).toBeInTheDocument();

    type("Entidad ejecutora", "UFPS");
    submit();
    expect(screen.getByText("Falta la duración (meses).")).toBeInTheDocument();

    type("Duración (meses)", "61");
    submit();
    expect(screen.getByText("La duración (meses) debe ser un número entero entre 1 y 60.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía ejecutora, duración y la patrocinadora solo si se escribió", () => {
    const onSubmit = renderForm();
    type("Entidad ejecutora", " UFPS ");
    type("Duración (meses)", "12");

    submit();

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ executingEntity: "UFPS", sponsorEntity: undefined, durationMonths: 12 }),
    );
  });

  it("usa la etiqueta de competencias requeridas por el proyecto", () => {
    renderForm();

    expect(screen.getByText("Competencias técnicas y blandas requeridas por el proyecto")).toBeInTheDocument();
    expect(screen.queryByText(/habilidades técnicas y blandas conocidas/i)).not.toBeInTheDocument();
  });

  it("precarga un borrador (desde una necesidad) y lo envía como proyecto nuevo", () => {
    const onSubmit = jest.fn();
    render(
      <ProjectForm
        defaults={{
          title: "Plataforma de citas",
          summary: "Los estudiantes no pueden reservar citas.",
          objectives: "Ofrecer reservas en línea.",
          executingEntity: "Bienestar Universitario",
          durationMonths: 6,
          typeId: "type-1",
          knownSkills: [],
          deliverables: [{ name: "Prototipo", scope: "Reservas en línea" }],
        }}
        submitLabel="Crear proyecto"
        isSaving={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );
    expect(field("Título del proyecto")).toHaveValue("Plataforma de citas");
    fireEvent.click(screen.getByRole("button", { name: "Crear proyecto" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Plataforma de citas",
        executingEntity: "Bienestar Universitario",
        durationMonths: 6,
        typeId: "type-1",
        // Es un proyecto nuevo: sin patrocinadora ni programa no se envía null.
        sponsorEntity: undefined,
        programId: undefined,
        deliverables: [{ name: "Prototipo", scope: "Reservas en línea" }],
      }),
    );
  });
});

