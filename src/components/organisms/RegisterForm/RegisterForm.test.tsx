import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { apiClient } from "@/apis/client";
import { DATA_CONSENT_LABEL, TRUTHFULNESS_LABEL } from "@/modules/legal/legal-texts";
import { RegisterForm } from "./RegisterForm";

jest.mock("@/apis/client", () => ({ apiClient: { post: jest.fn() } }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog", () => ({
  useProgramsCatalog: () => ({
    programs: [{ id: "program-1", name: "Ingeniería de Sistemas" }],
    isLoading: false,
    error: "",
  }),
}));

const post = jest.mocked(apiClient.post);

function fillForm() {
  // El nombre accesible incluye la ayuda del campo ("Sin puntos ni espacios."): se busca por el inicio.
  const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`));
  const type = (label: string, value: string) => fireEvent.change(field(label), { target: { value } });
  type("Nombres", "Ana");
  type("Apellidos", "Pérez");
  type("Correo institucional", "ana@ufps.edu.co");
  fireEvent.change(field("Programa"), { target: { value: "program-1" } });
  type("Número de documento", "1090123456");
  type("Teléfono", "3001234567");
  type("Contraseña", "Secret123*");
  type("Confirmar", "Secret123*");
  fireEvent.click(screen.getByRole("checkbox", { name: DATA_CONSENT_LABEL }));
}

beforeEach(() => post.mockReset());

describe("RegisterForm: declaración de veracidad (v2.2, E2)", () => {
  it("no deja crear la cuenta sin la declaración", () => {
    render(<RegisterForm />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Debes declarar que la información registrada es verídica.")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("con la declaración envía truthfulnessDeclared junto a la autorización de datos", async () => {
    post.mockResolvedValue({ data: {} });
    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole("checkbox", { name: TRUTHFULNESS_LABEL }));

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        collaborator: expect.objectContaining({ dataConsent: true, truthfulnessDeclared: true }),
      }),
    );
  });

  it("cada casilla enlaza a su texto público", () => {
    render(<RegisterForm />);

    const hrefs = screen.getAllByRole("link", { name: /Ver texto/ }).map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/terminos/tratamiento-de-datos", "/terminos/declaracion-de-veracidad"]);
  });
});
