import {
  formatDocument,
  hasErrors,
  normalizeDocumentNumber,
  normalizePhone,
  toIdentificationForm,
  toIdentificationPayload,
  validateIdentification,
} from "./identification";

const valid = () => ({
  ...toIdentificationForm(),
  documentNumber: "1.090.123.456",
  phone: "(+57) 300 123-4567",
});

describe("identification (v2.1)", () => {
  it("normaliza documento y teléfono igual que el backend", () => {
    expect(normalizeDocumentNumber(" 1.090.123-456 ")).toBe("1090123456");
    expect(normalizeDocumentNumber("ab 12345")).toBe("AB12345");
    expect(normalizePhone("(+57) 300-123 4567")).toBe("+573001234567");
  });

  it("acepta datos válidos y arma el payload normalizado", () => {
    const form = { ...valid(), alternateEmail: " Otro@Gmail.com ", institutionalCode: "" };
    expect(hasErrors(validateIdentification(form, "ana@ufps.edu.co"))).toBe(false);
    expect(toIdentificationPayload(form)).toEqual({
      documentType: "CC",
      documentNumber: "1090123456",
      phone: "+573001234567",
      nationality: "Colombiana",
      alternateEmail: "otro@gmail.com",
      institutionalCode: null,
    });
  });

  it("valida el número según el tipo de documento", () => {
    expect(validateIdentification({ ...valid(), documentNumber: "AB123" }).documentNumber).toBe(
      "Solo dígitos, entre 5 y 15.",
    );
    expect(validateIdentification({ ...valid(), documentType: "PA", documentNumber: "AB12345" })).toEqual({});
  });

  it("marca teléfono corto, nacionalidad vacía y correo alterno igual al principal", () => {
    const errors = validateIdentification(
      { ...valid(), phone: "123", nationality: " ", alternateEmail: "ANA@ufps.edu.co" },
      "ana@ufps.edu.co",
    );
    expect(Object.keys(errors).sort()).toEqual(["alternateEmail", "nationality", "phone"]);
  });

  it("formatea el documento para listados", () => {
    expect(formatDocument({ documentType: "CC", documentNumber: "1090123456" })).toBe("CC 1090123456");
    expect(formatDocument({ documentType: null, documentNumber: null })).toBe("Sin documento");
  });
});
