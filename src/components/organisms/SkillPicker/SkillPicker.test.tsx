import { fireEvent, render, screen, within } from "@testing-library/react";
import type { Skill } from "@/apis/interfaces/catalogs";
import { SkillPicker } from "./SkillPicker";

const SKILLS: Skill[] = [
  { id: "s1", name: "React", type: "CONOCIMIENTO", category: "FRAMEWORK", synonyms: [], status: "ACTIVA" },
  { id: "s2", name: "Redux", type: "CONOCIMIENTO", category: "FRAMEWORK", synonyms: [], status: "ACTIVA" },
];

// Por defecto el catálogo ya "respondió" a la búsqueda "re": el picker muestra los resultados sin esperar.
const mockSearch = jest.fn();
let mockCatalog: Record<string, unknown> = {};
const defaultCatalog = () => ({
  skills: SKILLS,
  resultsQuery: "re",
  failedQuery: null,
  isLoading: false,
  error: "",
  search: mockSearch,
  proposeSkill: jest.fn(),
});
jest.mock("@/modules/catalogs/hooks/useSkillsCatalog/useSkillsCatalog", () => ({
  useSkillsCatalog: () => mockCatalog,
}));

beforeEach(() => {
  mockSearch.mockReset();
  mockCatalog = defaultCatalog();
});

function setup() {
  const onChange = jest.fn();
  render(<SkillPicker label="Habilidades" value={[]} onChange={onChange} />);
  const input = screen.getByRole("combobox", { name: "Habilidades" });
  fireEvent.change(input, { target: { value: "re" } });
  return { input, onChange };
}

describe("SkillPicker (combobox accesible)", () => {
  it("is labelled and exposes the results as a listbox", () => {
    const { input } = setup();

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toHaveAttribute("id", input.getAttribute("aria-controls"));
    expect(within(screen.getByRole("listbox")).getAllByRole("option").map((option) => option.textContent)).toEqual([
      expect.stringContaining("React"),
      expect.stringContaining("Redux"),
    ]);
  });

  it("moves with the arrows and picks the highlighted option with Enter", () => {
    const { input, onChange } = setup();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const active = within(screen.getByRole("listbox")).getByRole("option", { selected: true });
    expect(active).toHaveTextContent("Redux");
    expect(input).toHaveAttribute("aria-activedescendant", active.id);

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith([SKILLS[1]]);
  });

  it("closes only the list with Escape, without reaching the modal that contains it", () => {
    const modalEscape = jest.fn();
    window.addEventListener("keydown", modalEscape);
    const { input } = setup();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(modalEscape).not.toHaveBeenCalled();
    window.removeEventListener("keydown", modalEscape);
  });

  it("shows the error with a retry instead of staying in 'Buscando…' when the search fails", () => {
    mockCatalog = {
      ...defaultCatalog(),
      skills: [],
      resultsQuery: null,
      failedQuery: "re",
      error: "No hay conexión con el servidor.",
    };
    setup();

    expect(screen.queryByText("Buscando…")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("No hay conexión con el servidor.");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(mockSearch).toHaveBeenCalledWith("re", undefined);
  });
});
