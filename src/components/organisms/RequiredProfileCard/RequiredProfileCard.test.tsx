import { fireEvent, render, screen, within } from "@testing-library/react";
import { AI_PROFILE, MANUAL_PROFILE } from "@/modules/analysis/test-fixtures";
import { RequiredProfileCard } from "./RequiredProfileCard";

describe("RequiredProfileCard", () => {
  it("muestra cantidad, prioridad, horas, etiqueta IA y la justificación", () => {
    render(<RequiredProfileCard profile={AI_PROFILE} />);

    expect(screen.getByRole("heading", { name: AI_PROFILE.name })).toBeInTheDocument();
    expect(screen.getByText("2 personas")).toBeInTheDocument();
    expect(screen.getByText("Prioridad alta")).toBeInTheDocument();
    expect(screen.getByText(/Mínimo 10 h\/semana/)).toBeInTheDocument();
    expect(screen.getByText("IA")).toBeInTheDocument();
    const justification = screen.getByRole("region", { name: "Justificación" });
    expect(within(justification).getByText(AI_PROFILE.justification)).toBeInTheDocument();
  });

  it("separa las habilidades técnicas de las blandas", () => {
    render(<RequiredProfileCard profile={AI_PROFILE} />);

    const technical = screen.getByRole("list", { name: "Conocimientos y competencias" });
    const soft = screen.getByRole("list", { name: "Habilidades blandas" });
    expect(within(technical).getAllByRole("listitem")).toHaveLength(2);
    expect(within(soft).getByLabelText(/Trabajo en equipo: nivel mínimo Avanzado, importancia baja/)).toBeInTheDocument();
  });

  it("marca las habilidades que no están en el catálogo", () => {
    render(<RequiredProfileCard profile={AI_PROFILE} />);

    expect(screen.getByLabelText("LoRaWAN: nivel mínimo Básico, importancia media, no catalogada")).toBeInTheDocument();
    expect(screen.getByLabelText("Arduino: nivel mínimo Intermedio, importancia alta")).toBeInTheDocument();
  });

  it("un perfil manual sin justificación lo dice y no muestra horas", () => {
    render(<RequiredProfileCard profile={MANUAL_PROFILE} />);

    expect(screen.getByText("Manual")).toBeInTheDocument();
    expect(screen.getByText("Sin justificación registrada.")).toBeInTheDocument();
    expect(screen.queryByText(/h\/semana/)).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Habilidades blandas" })).not.toBeInTheDocument();
  });

  it("solo muestra las acciones si recibe los callbacks", () => {
    const onEdit = jest.fn();
    const onDiscard = jest.fn();
    const { rerender } = render(<RequiredProfileCard profile={AI_PROFILE} />);
    expect(screen.queryByRole("button", { name: /Editar/ })).not.toBeInTheDocument();

    rerender(<RequiredProfileCard profile={AI_PROFILE} onEdit={onEdit} onDiscard={onDiscard} />);
    fireEvent.click(screen.getByRole("button", { name: `Editar ${AI_PROFILE.name}` }));
    fireEvent.click(screen.getByRole("button", { name: `Descartar ${AI_PROFILE.name}` }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });
});
