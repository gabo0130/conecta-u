import { formatAcceptanceRate, formatDecisionCounts } from "./evaluation-view";

describe("evaluation-view", () => {
  it("formatea la tasa como porcentaje con coma", () => {
    expect(formatAcceptanceRate(0.6667)).toBe("66,7 %");
    expect(formatAcceptanceRate(1)).toBe("100 %");
    expect(formatAcceptanceRate(null)).toBe("—");
  });

  it("concuerda singular y plural", () => {
    expect(formatDecisionCounts({ accepted: 1, discarded: 2 })).toBe("1 aceptada · 2 descartadas");
  });
});
