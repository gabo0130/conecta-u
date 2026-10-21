import { fireEvent, render, screen } from "@testing-library/react";
import { Input, Modal } from "@/components/atoms";
import { RowActions } from "./RowActions";

describe("RowActions", () => {
  it("abre la vista y la edición sin disparar el clic de la fila", () => {
    const onView = jest.fn();
    const onEdit = jest.fn();
    const onRow = jest.fn();
    render(
      <table>
        <tbody>
          <tr onClick={onRow}>
            <td>
              <RowActions name="Ingeniería de Sistemas" onView={onView} onEdit={onEdit} />
            </td>
          </tr>
        </tbody>
      </table>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ver Ingeniería de Sistemas" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar Ingeniería de Sistemas" }));

    expect(onView).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onRow).not.toHaveBeenCalled();
  });
});

describe("Modal en modo vista", () => {
  it("deshabilita los campos, oculta guardar y eliminar y solo deja Cerrar", () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();
    render(
      <Modal
        title="Detalle del programa"
        readOnly
        onClose={onClose}
        onSubmit={onSubmit}
        dangerAction={{ label: "Eliminar", onClick: jest.fn() }}
      >
        <Input label="Nombre" value="Ingeniería de Sistemas" onChange={jest.fn()} />
      </Modal>,
    );

    expect(screen.getByLabelText("Nombre")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Guardar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
