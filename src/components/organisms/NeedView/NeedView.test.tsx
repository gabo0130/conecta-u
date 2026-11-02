import { render, screen } from "@testing-library/react";
import type { Need } from "@/apis/interfaces/needs";
import { NeedView } from "./NeedView";

jest.mock("@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog", () => ({
  useProjectTypesCatalog: () => ({ projectTypes: [{ id: "t1", code: "CURSO", name: "Curso" }], isLoading: false, error: "" }),
}));

const need: Need = {
  id: "n1",
  title: "Citas de Bienestar",
  description: "Bienestar necesita que los estudiantes reserven citas en línea.",
  kind: "BIENESTAR",
  status: "CARACTERIZADA",
  urgency: 4,
  impact: 5,
  deadline: null,
  dependency: null,
  completeness: 55,
  priorityScore: 83,
  priorityLevel: "ALTA",
  projectId: null,
  createdById: "u1",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  characterizedAt: "2026-11-02T00:00:00Z",
  discardReason: null,
  missingElements: [],
  characterization: {
    problem: "No hay reservas en línea.",
    objective: "",
    beneficiaries: "Estudiantes",
    expectedResults: [],
    competencies: [],
    unmatchedCompetencies: ["Blockchain"],
    suggestedProjectTypeCode: "CURSO",
    missingInformation: ["Plazo esperado"],
    provider: "fake",
    model: "fake-1",
    promptVersion: "v1",
  },
};

describe("NeedView", () => {
  it("muestra las competencias fuera del catálogo aunque no haya ninguna emparejada", () => {
    render(<NeedView need={need} />);
    expect(screen.getByText("Blockchain")).toBeInTheDocument();
    expect(screen.getByText("Curso")).toBeInTheDocument();
    expect(screen.getByText("4 · Alta")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Plazo esperado");
  });

  it("sin caracterización explica qué hará la IA", () => {
    render(<NeedView need={{ ...need, characterization: null }} />);
    expect(screen.getByText(/Aún no se ha caracterizado/)).toBeInTheDocument();
  });
});
