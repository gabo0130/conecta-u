import { fireEvent, render, screen } from "@testing-library/react";
import { IMPORTED_RECOMMENDATION, RECOMMENDATION } from "@/modules/recommendations/test-fixtures";
import { RecommendationCard } from "./RecommendationCard";

describe("RecommendationCard", () => {
  it("muestra puesto, persona, programa, disponibilidad, habilidades y puntaje", () => {
    render(<RecommendationCard recommendation={RECOMMENDATION} onExplain={jest.fn()} />);

    expect(screen.getByRole("article", { name: "1. Ana Prueba" })).toBeInTheDocument();
    expect(screen.getByText("Estudiante")).toBeInTheDocument();
    expect(screen.getByText("Ingeniería de Sistemas")).toBeInTheDocument();
    expect(screen.getByText("Semillero de prueba")).toBeInTheDocument();
    expect(screen.getByText(/Disponible · 10 h\/semana/)).toBeInTheDocument();
    expect(screen.getByText("2 de 3 habilidades")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Puntaje 72 de 100" })).toHaveAttribute("aria-valuenow", "72");
    expect(screen.queryByText("Sin cuenta")).not.toBeInTheDocument();
  });

  it("marca a las personas sin cuenta en la plataforma", () => {
    render(<RecommendationCard recommendation={IMPORTED_RECOMMENDATION} onExplain={jest.fn()} />);

    expect(screen.getByText("Sin cuenta")).toBeInTheDocument();
    expect(screen.getByText(/Parcial/)).toBeInTheDocument();
  });

  it("abre el detalle con ¿Por qué?", () => {
    const onExplain = jest.fn();
    render(<RecommendationCard recommendation={RECOMMENDATION} onExplain={onExplain} />);

    fireEvent.click(screen.getByRole("button", { name: "¿Por qué se recomienda a Ana Prueba?" }));
    expect(onExplain).toHaveBeenCalledTimes(1);
  });

  it("permite marcar a la persona para convocarla y muestra si ya fue convocada (RF21–RF22)", () => {
    const onChange = jest.fn();
    render(
      <RecommendationCard
        recommendation={RECOMMENDATION}
        onExplain={jest.fn()}
        selection={{ checked: false, onChange }}
        invitedLabel="Convocada el 3 nov."
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Convocar a Ana Prueba por correo" }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("Convocada el 3 nov.")).toBeInTheDocument();
  });

  it("sin selección (ADMIN) no muestra la casilla", () => {
    render(<RecommendationCard recommendation={RECOMMENDATION} onExplain={jest.fn()} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("el líder acepta o descarta (tesis, T7) y ve su decisión", () => {
    const onDecide = jest.fn();
    const { rerender } = render(
      <RecommendationCard recommendation={RECOMMENDATION} onExplain={jest.fn()} onDecide={onDecide} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(onDecide).toHaveBeenCalledWith("ACEPTADA");

    rerender(
      <RecommendationCard
        recommendation={{
          ...RECOMMENDATION,
          feedback: { decision: "DESCARTADA", reason: null, rankAtDecision: 1, scoreAtDecision: 72.4, decidedAt: "" },
        }}
        onExplain={jest.fn()}
        onDecide={onDecide}
      />,
    );
    expect(screen.getByText("Descartada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descartar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Descartar" })).toHaveAttribute("aria-pressed", "true");
  });

  it("sin onDecide (ADMIN) solo muestra la decisión", () => {
    render(
      <RecommendationCard
        recommendation={{
          ...RECOMMENDATION,
          feedback: { decision: "ACEPTADA", reason: null, rankAtDecision: 1, scoreAtDecision: 72.4, decidedAt: "" },
        }}
        onExplain={jest.fn()}
      />,
    );
    expect(screen.getByText("Aceptada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aceptar" })).not.toBeInTheDocument();
  });
});
