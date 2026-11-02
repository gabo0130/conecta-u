import { formatDuration } from "./project-limits";

describe("formatDuration (v2.2, E5)", () => {
  it("dice los meses en singular o plural", () => {
    expect(formatDuration(1)).toBe("1 mes");
    expect(formatDuration(18)).toBe("18 meses");
  });

  it("devuelve null en proyectos anteriores a v2.2", () => {
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(undefined)).toBeNull();
  });
});
