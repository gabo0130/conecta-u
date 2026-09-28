import { formatDate, parseDate } from "./dates";

describe("parseDate", () => {
  it("reads a date without time as a local day (no UTC shift)", () => {
    const date = parseDate("2024-03-01");

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2024, 2, 1]);
  });

  it("keeps full ISO timestamps as they are", () => {
    expect(parseDate("2026-09-26T15:30:00.000Z").toISOString()).toBe("2026-09-26T15:30:00.000Z");
  });
});

describe("formatDate", () => {
  it("shows the month of a start date as stored, not the previous one", () => {
    expect(formatDate("2024-03-01", { month: "long", year: "numeric" })).toMatch(/marzo/);
  });

  it("returns an empty text for missing dates", () => {
    expect(formatDate(null, { year: "numeric" })).toBe("");
  });
});
