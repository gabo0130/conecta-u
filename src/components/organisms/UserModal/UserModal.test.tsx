import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { AdminUser } from "@/apis/interfaces/admin";
import { UserModal } from "./UserModal";

jest.mock("@/modules/catalogs/hooks/useProgramsCatalog/useProgramsCatalog", () => ({
  useProgramsCatalog: () => ({ programs: [], isLoading: false, error: "" }),
}));

const USER: AdminUser = {
  id: "u1",
  fullName: "Laura Méndez",
  email: "laura@ufps.edu.co",
  role: "COLABORADOR",
  active: true,
};

describe("UserModal: acceso a la plataforma (v2.2, E7)", () => {
  it("habla de inhabilitar el acceso y explica que los datos se conservan", async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined);
    render(<UserModal user={USER} onCreate={jest.fn()} onUpdate={onUpdate} onClose={jest.fn()} />);

    const access = screen.getByLabelText(/^Acceso a la plataforma/);
    expect(screen.getByText("La persona no podrá iniciar sesión; sus datos se conservan.")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Habilitar acceso" })).toBeInTheDocument();
    expect(screen.queryByText("Desactivar")).not.toBeInTheDocument();

    fireEvent.change(access, { target: { value: "false" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ active: false })));
  });
});
