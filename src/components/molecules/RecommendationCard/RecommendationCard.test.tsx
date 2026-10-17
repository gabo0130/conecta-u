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
});
