import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { TagsInput } from "./TagsInput";

function Harness({ max }: { max?: number }) {
  const [tags, setTags] = useState<string[]>(["IoT"]);
  return <TagsInput label="Palabras clave" value={tags} onChange={setTags} max={max} />;
}

const input = () => screen.getByLabelText("Palabras clave");

describe("TagsInput (v2.1, A6)", () => {
  it("agrega con Enter o coma y quita con la ×", () => {
    render(<Harness />);

    fireEvent.change(input(), { target: { value: "Sensores" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    fireEvent.change(input(), { target: { value: "Agua" } });
    fireEvent.keyDown(input(), { key: "," });
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["IoT", "Sensores", "Agua"]);

    fireEvent.click(screen.getByRole("button", { name: "Quitar Sensores" }));
    expect(screen.queryByText("Sensores")).not.toBeInTheDocument();
  });

  it("no repite palabras clave (sin importar mayúsculas)", () => {
    render(<Harness />);

    fireEvent.change(input(), { target: { value: "iot" } });
    fireEvent.keyDown(input(), { key: "Enter" });

    expect(screen.getByText('"iot" ya está en la lista.')).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("se bloquea al llegar al máximo", () => {
    render(<Harness max={2} />);

    fireEvent.change(input(), { target: { value: "Agua" } });
    fireEvent.keyDown(input(), { key: "Enter" });

    expect(input()).toBeDisabled();
  });
});
