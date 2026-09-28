import {
  EXPERIENCE_WEEKLY_HOURS,
  optionalInteger,
  SEMESTER,
  validateExperienceDates,
  validateInteger,
  validateProfileUrl,
} from "./collaborator-limits";

describe("validateInteger", () => {
  it("does not turn an empty required field into 0", () => {
    expect(validateInteger("", EXPERIENCE_WEEKLY_HOURS, { label: "La dedicación" })).toBe(
      "Falta la dedicación.",
    );
  });

  it("accepts an empty optional field", () => {
    expect(validateInteger(" ", SEMESTER, { label: "El semestre", required: false })).toBeNull();
  });

  it("rejects values out of range and decimals", () => {
    expect(validateInteger("0", EXPERIENCE_WEEKLY_HOURS, { label: "La dedicación" })).toMatch(/entre 1 y 60/);
    expect(validateInteger("61", EXPERIENCE_WEEKLY_HOURS, { label: "La dedicación" })).toMatch(/entre 1 y 60/);
    expect(validateInteger("7.5", SEMESTER, { label: "El semestre" })).toMatch(/entero/);
  });

  it("accepts a valid integer", () => {
    expect(validateInteger("12", SEMESTER, { label: "El semestre" })).toBeNull();
  });
});

describe("optionalInteger", () => {
  it("sends null for an empty value so a saved one can be cleared", () => {
    expect(optionalInteger("")).toBeNull();
    expect(optionalInteger("4")).toBe(4);
  });
});

describe("validateExperienceDates", () => {
  it("rejects an end date before the start date", () => {
    expect(validateExperienceDates("2024-05-01", "2024-04-30", false)).toMatch(/anterior a la de inicio/);
  });

  it("asks for an end date unless the experience is current", () => {
    expect(validateExperienceDates("2024-05-01", "", false)).toMatch(/fecha de fin/);
    expect(validateExperienceDates("2024-05-01", "", true)).toBeNull();
  });

  it("accepts the same day and later dates", () => {
    expect(validateExperienceDates("2024-05-01", "2024-05-01", false)).toBeNull();
    expect(validateExperienceDates("2023-02-01", "2023-11-30", false)).toBeNull();
  });
});

describe("validateProfileUrl", () => {
  it("accepts an empty value and http(s) links", () => {
    expect(validateProfileUrl("")).toBeNull();
    expect(validateProfileUrl("https://github.com/ana")).toBeNull();
    expect(validateProfileUrl("http://portafolio.co")).toBeNull();
  });

  it("rejects other protocols, hosts without a domain and links over 300 characters", () => {
    expect(validateProfileUrl("javascript:alert(1)")).toMatch(/http:\/\/ o https:\/\//);
    expect(validateProfileUrl("github.com/ana")).not.toBeNull();
    expect(validateProfileUrl("http://localhost")).not.toBeNull();
    expect(validateProfileUrl(`https://a.co/${"x".repeat(300)}`)).not.toBeNull();
  });
});
