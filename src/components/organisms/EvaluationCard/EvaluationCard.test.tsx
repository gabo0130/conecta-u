import { render, screen } from "@testing-library/react";
import { useEvaluationSummary } from "@/modules/admin/hooks/useEvaluationSummary/useEvaluationSummary";
import { EvaluationCard } from "./EvaluationCard";

jest.mock("@/modules/admin/hooks/useEvaluationSummary/useEvaluationSummary", () => ({
  useEvaluationSummary: jest.fn(),
}));

const mocked = jest.mocked(useEvaluationSummary);
const base = { isLoading: false, error: "", reload: jest.fn() };

describe("EvaluationCard", () => {
  it("muestra la tasa global y por proyecto", () => {
    mocked.mockReturnValue({
      ...base,
      summary: {
        acceptance: { accepted: 3, discarded: 1, decided: 4, acceptanceRate: 0.75 },
        byProject: [
          { projectId: "p1", projectTitle: "Huerta IoT", accepted: 3, discarded: 1, decided: 4, acceptanceRate: 0.75 },
        ],
      },
    });
    render(<EvaluationCard />);
    expect(screen.getAllByText("75 %")).toHaveLength(2);
    expect(screen.getByRole("meter", { name: /Huerta IoT/ })).toHaveAttribute("aria-valuenow", "75");
  });

  it("sin decisiones lo explica en vez de mostrar 0 %", () => {
    mocked.mockReturnValue({
      ...base,
      summary: { acceptance: { accepted: 0, discarded: 0, decided: 0, acceptanceRate: null }, byProject: [] },
    });
    render(<EvaluationCard />);
    expect(screen.getByText(/Aún no hay decisiones/)).toBeInTheDocument();
  });
});
