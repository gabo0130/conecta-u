import { isValidPassword, passwordRules, readResetToken } from "./password-rules";

describe("password-rules", () => {
  it("exige 8 caracteres, letras y números y máximo 72 bytes", () => {
    expect(isValidPassword("Nueva2026")).toBe(true);
    expect(isValidPassword("corta1")).toBe(false);
    expect(isValidPassword("solotexto")).toBe(false);
    expect(isValidPassword("12345678")).toBe(false);
    expect(isValidPassword(`ñ1${"ñ".repeat(40)}`)).toBe(false);
    expect(passwordRules("").map((rule) => rule.ok)).toEqual([false, false, true]);
  });

  it("lee solo un token bien formado del fragmento", () => {
    const token = "a".repeat(43);
    expect(readResetToken(`#token=${token}`)).toBe(token);
    expect(readResetToken("#token=corto")).toBeNull();
    expect(readResetToken("")).toBeNull();
  });
});
