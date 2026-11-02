import { fireEvent, render, screen } from "@testing-library/react";
import { NeedForm } from "./NeedForm";

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label, { exact: false }), { target: { value } });

describe("NeedForm", () => {
  it("valida en línea y no envía una descripción corta", () => {
    const onSubmit = jest.fn();
    render(<NeedForm submitLabel="Registrar" isSaving={false} onSubmit={onSubmit} onCancel={jest.fn()} />);
    fill("Título", "Citas de Bienestar");
    fill("Describe la necesidad", "Muy corta");
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/al menos 30 caracteres/)).toBeInTheDocument();
  });

  it("envía la necesidad con escala numérica y omite los opcionales vacíos", () => {
    const onSubmit = jest.fn();
    render(<NeedForm submitLabel="Registrar" isSaving={false} onSubmit={onSubmit} onCancel={jest.fn()} />);
    fill("Título", "  Citas de Bienestar ");
    fill("Describe la necesidad", "Bienestar necesita que los estudiantes reserven citas en línea.");
    fireEvent.change(screen.getByLabelText("Tipo de necesidad"), { target: { value: "BIENESTAR" } });
    fireEvent.change(screen.getByLabelText("Urgencia"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Citas de Bienestar",
      description: "Bienestar necesita que los estudiantes reserven citas en línea.",
      kind: "BIENESTAR",
      urgency: 5,
      impact: 3,
      deadline: undefined,
      dependency: undefined,
    });
  });

  it("al editar, vaciar un opcional lo borra (null)", () => {
    const onSubmit = jest.fn();
    render(
      <NeedForm
        initial={{
          id: "n1",
          title: "Citas de Bienestar",
          description: "Bienestar necesita que los estudiantes reserven citas en línea.",
          kind: "BIENESTAR",
          status: "REGISTRADA",
          urgency: 4,
          impact: 2,
          deadline: "2027-01-01",
          dependency: "Bienestar",
          completeness: 15,
          priorityScore: 51,
          priorityLevel: "MEDIA",
          projectId: null,
          createdById: "u1",
          createdAt: "2026-11-01T00:00:00Z",
          updatedAt: "2026-11-01T00:00:00Z",
          characterization: null,
          characterizedAt: null,
          discardReason: null,
          missingElements: [],
        }}
        submitLabel="Guardar"
        isSaving={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );
    fill("Dependencia que la plantea", "");
    fill("Plazo esperado", "");
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ urgency: 4, impact: 2, deadline: null, dependency: null }),
    );
  });
});
