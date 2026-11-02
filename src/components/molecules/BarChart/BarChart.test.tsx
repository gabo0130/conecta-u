import { render, screen } from "@testing-library/react";
import { BarChart } from "./BarChart";

// El lienzo de Chart.js no existe en jsdom; aquí se prueba lo que el usuario lee sin el gráfico.
jest.mock("react-chartjs-2", () => ({
  Bar: () => <canvas data-testid="chart" />,
}));

describe("BarChart", () => {
  it("dibuja el gráfico y una tabla equivalente para lectores de pantalla", () => {
    render(
      <BarChart
        label="Oferta y demanda de habilidades"
        categories={["Python", "Liderazgo"]}
        series={[
          { name: "Personas que la ofrecen", values: [3, 1] },
          {
            name: "Perfiles que la piden",
            values: [2, 4],
            display: ["2 perfiles", "4 perfiles"],
          },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "Oferta y demanda de habilidades" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Oferta y demanda de habilidades" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Liderazgo" })).toBeInTheDocument();
    expect(screen.getByText("4 perfiles")).toBeInTheDocument();
  });

  it("muestra el mensaje cuando no hay datos", () => {
    render(<BarChart label="x" categories={[]} series={[]} emptyMessage="Aún no hay datos." />);
    expect(screen.getByText("Aún no hay datos.")).toBeInTheDocument();
  });
});
