import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { TRUTHFULNESS_DECLARATION, TRUTHFULNESS_LABEL } from "@/modules/legal/legal-texts";
import { LegalCheckbox } from "./LegalCheckbox";

function Harness() {
  const [checked, setChecked] = useState(false);
  return (
    <LegalCheckbox
      label={TRUTHFULNESS_LABEL}
      href={TRUTHFULNESS_DECLARATION.href}
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
    />
  );
}

describe("LegalCheckbox (v2.2, E2)", () => {
  it("se marca con su texto y enlaza al texto completo en otra pestaña", () => {
    render(<Harness />);

    const checkbox = screen.getByRole("checkbox", { name: TRUTHFULNESS_LABEL });
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const link = screen.getByRole("link", { name: /Ver texto/ });
    expect(link).toHaveAttribute("href", "/terminos/declaracion-de-veracidad");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("abrir el texto no marca la casilla", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("link", { name: /Ver texto/ }));

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
