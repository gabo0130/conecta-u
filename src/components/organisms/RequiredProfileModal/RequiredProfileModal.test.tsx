import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { RequiredProfile } from "@/apis/interfaces/analysis";
import type { Skill } from "@/apis/interfaces/catalogs";
import { AI_PROFILE } from "@/modules/analysis/test-fixtures";
import { ProfileTimeoutError } from "@/modules/analysis/utils/analysis-view";
import { notify } from "@/utils/notify";
import { RequiredProfileModal } from "./RequiredProfileModal";

const FIGMA: Skill = { id: "s5", name: "Figma", type: "CONOCIMIENTO", category: "DISENO_UX", synonyms: [], status: "ACTIVA" };

jest.mock("@/modules/catalogs/hooks/useSkillsCatalog/useSkillsCatalog", () => ({
  useSkillsCatalog: () => ({
    skills: [FIGMA],
    resultsQuery: "fi",
    failedQuery: null,
    isLoading: false,
    error: "",
    search: jest.fn(),
    proposeSkill: jest.fn(),
  }),
}));
jest.mock("@/utils/notify", () => ({ notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() } }));

function renderModal(profile?: RequiredProfile) {
  const onCreate = jest.fn().mockResolvedValue(undefined);
  const onUpdate = jest.fn().mockResolvedValue(undefined);
  const onClose = jest.fn();
  render(<RequiredProfileModal profile={profile} onCreate={onCreate} onUpdate={onUpdate} onClose={onClose} />);
  return { onCreate, onUpdate, onClose };
}

const pickFigma = () => {
  fireEvent.change(screen.getByRole("combobox", { name: /Habilidades/ }), { target: { value: "fi" } });
  fireEvent.click(within(screen.getByRole("listbox")).getByText("Figma"));
};

describe("RequiredProfileModal", () => {
  it("crea un perfil con habilidades del catálogo, nivel e importancia", async () => {
    const { onCreate, onClose } = renderModal();

    fireEvent.change(screen.getByLabelText("Nombre del perfil"), { target: { value: "Diseñador de interfaces" } });
    pickFigma();
    fireEvent.change(screen.getByLabelText("Nivel mínimo de Figma"), { target: { value: "AVANZADO" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar perfil" }));

    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate).toHaveBeenCalledWith({
      name: "Diseñador de interfaces",
      quantity: 1,
      priority: "MEDIA",
      skills: [{ skillId: "s5", minLevel: "AVANZADO", importance: "MEDIA" }],
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("no envía sin habilidades y lo dice en línea", () => {
    const { onCreate } = renderModal();

    fireEvent.change(screen.getByLabelText("Nombre del perfil"), { target: { value: "Diseñador" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar perfil" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Agrega al menos una habilidad del catálogo.");
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("al editar sin tocar las habilidades conserva las no catalogadas (no envía skills)", async () => {
    const { onUpdate } = renderModal(AI_PROFILE);

    expect(screen.getByText(/se conservan mientras no cambies la lista/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nombre del perfil"), { target: { value: "Hardware e IoT" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    // Solo lo que cambió: ni skills ni los demás campos.
    expect(onUpdate).toHaveBeenCalledWith({ name: "Hardware e IoT" });
  });

  it("sin cambios cierra sin llamar al backend", () => {
    const { onUpdate, onClose } = renderModal(AI_PROFILE);

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("si el guardado se corta por tiempo, cierra y avisa en vez de dejar reenviarlo", async () => {
    const onCreate = jest.fn().mockRejectedValue(new ProfileTimeoutError());
    const onClose = jest.fn();
    render(<RequiredProfileModal onCreate={onCreate} onUpdate={jest.fn()} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText("Nombre del perfil"), { target: { value: "Diseñador" } });
    pickFigma();
    fireEvent.click(screen.getByRole("button", { name: "Agregar perfil" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(notify.warning).toHaveBeenCalledWith(expect.stringContaining("puede que ya se haya guardado"));
  });

  it("si la lista cambia, avisa que las no catalogadas no se guardarán", async () => {
    const { onUpdate } = renderModal(AI_PROFILE);

    fireEvent.click(screen.getByRole("button", { name: "Quitar Trabajo en equipo" }));
    expect(screen.getByText(/no se guardarán/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    expect(onUpdate.mock.calls[0][0].skills).toEqual([{ skillId: "s1", minLevel: "INTERMEDIO", importance: "ALTA" }]);
  });
});
