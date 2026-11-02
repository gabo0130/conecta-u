import { render, screen } from "@testing-library/react";
import { BarList } from "./BarList";

describe("BarList", () => {
  it("muestra cada fila con su texto y una barra proporcional al máximo", () => {
    const { container } = render(
      <BarList
        label="Proyectos por tipo"
        items={[
          { key: "a", label: "Investigación", value: 4 },
          { key: "b", label: "Curso", value: 2, display: "2 proyectos" },
        ]}
      />,
    );

    expect(screen.getByRole("list", { name: "Proyectos por tipo" })).toBeInTheDocument();
    expect(screen.getByText("Investigación")).toBeInTheDocument();
    expect(screen.getByText("2 proyectos")).toBeInTheDocument();
    const bars = container.querySelectorAll<HTMLDivElement>("[aria-hidden] > div");
    expect(bars[0].style.width).toBe("100%");
    expect(bars[1].style.width).toBe("50%");
  });

  it("muestra el mensaje vacío", () => {
    render(<BarList label="x" items={[]} emptyMessage="Aún no hay perfiles." />);
    expect(screen.getByText("Aún no hay perfiles.")).toBeInTheDocument();
  });
});
