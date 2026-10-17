import { barWidth, componentContributions, formatMonths, formatPercent, scoreTone } from "./recommendation-view";

describe("recommendation-view", () => {
  it("clasifica el puntaje para el color de la barra", () => {
    expect(scoreTone(85)).toBe("high");
    expect(scoreTone(70)).toBe("high");
    expect(scoreTone(51.13)).toBe("medium");
    expect(scoreTone(12)).toBe("low");
  });

  it("acota el ancho de la barra entre 0 y 100 %", () => {
    expect(barWidth(51.13)).toBe("51.13%");
    expect(barWidth(-3)).toBe("0%");
    expect(barWidth(140)).toBe("100%");
  });

  it("formatea porcentajes y meses", () => {
    expect(formatPercent(0.5182)).toBe("52 %");
    expect(formatMonths(1)).toBe("1 mes");
    expect(formatMonths(18)).toBe("18 meses");
  });

  it("los aportes de cada componente suman el puntaje", () => {
    const components = { skills: 0.5182, semantic: 0.5109, experience: 0, availability: 1 };
    const weights = { skills: 0.5, semantic: 0.2, experience: 0.15, availability: 0.15 };
    const rows = componentContributions(components, weights);

    expect(rows.map((row) => row.key)).toEqual(["skills", "semantic", "experience", "availability"]);
    const total = rows.reduce((sum, row) => sum + row.points, 0);
    expect(total).toBeCloseTo(51.13, 0);
  });

  it("un componente sin peso (semántica sin embeddings) no aporta", () => {
    const rows = componentContributions(
      { skills: 1, semantic: 0, experience: 0, availability: 1 },
      { skills: 0.625, semantic: 0, experience: 0.1875, availability: 0.1875 },
    );

    expect(rows.find((row) => row.key === "semantic")?.points).toBe(0);
  });
});
