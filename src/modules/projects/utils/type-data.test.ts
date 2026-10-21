import type { TemplateField } from "@/apis/interfaces/catalogs";
import { formatCOP, missingRequiredFields, pickTemplateData, tagsCountError } from "./type-data";

const course: TemplateField[] = [
  { key: "asignatura", label: "Asignatura", kind: "text", required: true },
  { key: "semestre", label: "Semestre", kind: "select", required: true, options: ["2026-1", "2026-2"] },
  { key: "fecha", label: "Fecha de entrega", kind: "date", required: false },
];

const extension: TemplateField[] = [
  { key: "entidad", label: "Entidad aliada", kind: "text", required: true },
  { key: "fecha", label: "Fecha de inicio", kind: "date", required: false },
];

describe("pickTemplateData", () => {
  it("drops the fields of the previous type and keeps the shared ones", () => {
    const fromCourse = { asignatura: "Software II", semestre: "2026-2", fecha: "2026-11-30" };

    expect(pickTemplateData(extension, fromCourse)).toEqual({ fecha: "2026-11-30" });
  });

  it("removes empty values and trims texts", () => {
    expect(pickTemplateData(course, { asignatura: "  Software II ", semestre: "", fecha: undefined })).toEqual({
      asignatura: "Software II",
    });
  });
});

describe("missingRequiredFields", () => {
  it("lists the required fields without value", () => {
    const missing = missingRequiredFields(course, { asignatura: "Software II", semestre: " " });

    expect(missing.map((field) => field.label)).toEqual(["Semestre"]);
  });

  it("returns nothing when every required field is filled", () => {
    expect(missingRequiredFields(extension, { entidad: "Cámara de Comercio" })).toEqual([]);
  });

  it("treats NaN from an empty number input as missing", () => {
    const fields: TemplateField[] = [{ key: "horas", label: "Horas", kind: "number", required: true }];

    expect(missingRequiredFields(fields, { horas: Number.NaN })).toHaveLength(1);
  });
});

describe("palabras clave y valor en pesos (v2.1, A6)", () => {
  const fields: TemplateField[] = [
    { key: "palabras", label: "Palabras clave", kind: "tags", required: true, minItems: 3, maxItems: 5 },
    { key: "costo", label: "Costo", kind: "currency", required: false },
  ];

  it("una lista vacía cuenta como campo sin llenar", () => {
    expect(missingRequiredFields(fields, { palabras: [] }).map((field) => field.key)).toEqual(["palabras"]);
    expect(pickTemplateData(fields, { palabras: [], costo: 0 })).toEqual({ costo: 0 });
  });

  it("revisa la cantidad de palabras clave con el mismo mensaje que el backend", () => {
    expect(tagsCountError(fields, { palabras: ["a", "b"] })).toBe(
      "Palabras clave necesita entre 3 y 5 palabras clave.",
    );
    expect(tagsCountError(fields, { palabras: ["a", "b", "c"] })).toBeNull();
  });

  it("formatea pesos colombianos sin centavos", () => {
    expect(formatCOP(12000000).replace(/\s/g, " ")).toMatch(/12\.000\.000/);
  });
});
