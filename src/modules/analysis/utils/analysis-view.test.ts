import { AI_PROFILE } from "../test-fixtures";
import {
  toCreatePayload,
  toProfileForm,
  toUpdatePayload,
  validateProfileForm,
  type ProfileSkillRow,
  type RequiredProfileForm,
} from "./analysis-view";

const FIGMA: ProfileSkillRow = {
  skillId: "s1",
  name: "Figma",
  type: "CONOCIMIENTO",
  minLevel: "INTERMEDIO",
  importance: "ALTA",
};

const validNew = (): RequiredProfileForm => ({
  ...toProfileForm(),
  name: "Diseñador",
  skills: [FIGMA],
  skillsChanged: true,
});

describe("validateProfileForm", () => {
  it("exige nombre, cantidad 1–10 y horas 1–60 si se indican", () => {
    expect(validateProfileForm({ ...validNew(), name: "  " })).toMatch(/nombre/);
    expect(validateProfileForm({ ...validNew(), quantity: "11" })).toMatch(/entre 1 y 10/);
    expect(validateProfileForm({ ...validNew(), quantity: "" })).toMatch(/Falta/);
    expect(validateProfileForm({ ...validNew(), minWeeklyHours: "0" })).toMatch(/entre 1 y 60/);
    expect(validateProfileForm({ ...validNew(), minWeeklyHours: "" })).toBeNull();
  });

  it("exige entre 1 y 8 habilidades del catálogo cuando la lista cambió", () => {
    expect(validateProfileForm({ ...validNew(), skills: [] })).toMatch(/al menos una/);
    const nine = Array.from({ length: 9 }, (_, i) => ({ ...FIGMA, skillId: `s${i}` }));
    expect(validateProfileForm({ ...validNew(), skills: nine })).toMatch(/máximo 8/);
  });
});

describe("payloads", () => {
  it("al crear omite los opcionales vacíos", () => {
    expect(toCreatePayload(validNew())).toEqual({
      name: "Diseñador",
      quantity: 1,
      priority: "MEDIA",
      skills: [{ skillId: "s1", minLevel: "INTERMEDIO", importance: "ALTA" }],
    });
  });

  it("al editar envía solo lo que cambió (cambiar la prioridad no toca nombre ni descripción)", () => {
    const initial = toProfileForm(AI_PROFILE);
    expect(toUpdatePayload({ ...initial, priority: "BAJA" }, initial)).toEqual({ priority: "BAJA" });
    expect(toUpdatePayload({ ...initial, name: ` ${initial.name} ` }, initial)).toEqual({});
  });

  it("vaciar un opcional lo envía como null", () => {
    const initial = toProfileForm(AI_PROFILE);
    expect(toUpdatePayload({ ...initial, minWeeklyHours: "", description: "" }, initial)).toEqual({
      minWeeklyHours: null,
      description: null,
    });
  });

  it("si la lista cambió, envía solo las del catálogo (si no, no envía skills)", () => {
    const initial = toProfileForm(AI_PROFILE);
    expect(toUpdatePayload(initial, initial)).not.toHaveProperty("skills");
    const form = { ...initial, skillsChanged: true };
    expect(toUpdatePayload(form, initial).skills).toEqual([
      { skillId: "s1", minLevel: "INTERMEDIO", importance: "ALTA" },
      { skillId: "s9", minLevel: "AVANZADO", importance: "BAJA" },
    ]);
  });
});
