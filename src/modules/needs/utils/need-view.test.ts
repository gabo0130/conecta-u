import { formatScore, isOpenNeed, NEED_STATUS_FILTER_OPTIONS, validateNeed } from "./need-view";

describe("need-view", () => {
  it("valida título y descripción con los mismos mínimos que el backend", () => {
    expect(validateNeed({ title: "Hola", description: "x".repeat(40) })).toMatch(/al menos 5/);
    expect(validateNeed({ title: "Citas de Bienestar", description: "   corta   " })).toMatch(/al menos 30/);
    expect(validateNeed({ title: "Citas de Bienestar", description: "x".repeat(30) })).toBeNull();
  });

  it("solo REGISTRADA y CARACTERIZADA están abiertas", () => {
    expect(isOpenNeed("REGISTRADA")).toBe(true);
    expect(isOpenNeed("CARACTERIZADA")).toBe(true);
    expect(isOpenNeed("CONVERTIDA")).toBe(false);
    expect(isOpenNeed("DESCARTADA")).toBe(false);
  });

  it("formatea los puntajes con coma decimal", () => {
    expect(formatScore(72.5)).toBe("72,5");
    expect(formatScore(80)).toBe("80");
  });

  it("el filtro de estado empieza por «Todos»", () => {
    expect(NEED_STATUS_FILTER_OPTIONS[0]).toEqual({ value: "", label: "Todos los estados" });
    expect(NEED_STATUS_FILTER_OPTIONS.map((option) => option.value)).toContain("CONVERTIDA");
  });
});
