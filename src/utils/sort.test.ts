import { nextSort, sortItems } from "./sort";
import type { SortAccessors } from "./sort";

type Row = { name: string; count: number | null };

const accessors: SortAccessors<Row, "name" | "count"> = {
  name: (row) => row.name,
  count: (row) => row.count,
};

const rows: Row[] = [
  { name: "beta", count: 10 },
  { name: "Álvaro", count: null },
  { name: "alfa", count: 2 },
  { name: "Fila 10", count: 9 },
  { name: "Fila 9", count: 2 },
];

describe("nextSort", () => {
  it("cicla ascendente → descendente → sin orden", () => {
    const asc = nextSort(null, "name");
    expect(asc).toEqual({ key: "name", direction: "asc" });
    const desc = nextSort(asc, "name");
    expect(desc).toEqual({ key: "name", direction: "desc" });
    expect(nextSort(desc, "name")).toBeNull();
  });

  it("otra columna empieza en ascendente", () => {
    expect(nextSort({ key: "name", direction: "desc" }, "count")).toEqual({ key: "count", direction: "asc" });
  });
});

describe("sortItems", () => {
  it("sin orden devuelve la lista tal cual", () => {
    expect(sortItems(rows, null, accessors)).toBe(rows);
  });

  it("ordena texto en español sin distinguir mayúsculas ni tildes, con números naturales", () => {
    const names = sortItems(rows, { key: "name", direction: "asc" }, accessors).map((row) => row.name);
    expect(names).toEqual(["alfa", "Álvaro", "beta", "Fila 9", "Fila 10"]);
  });

  it("ordena números y deja los vacíos al final en ambos sentidos", () => {
    const asc = sortItems(rows, { key: "count", direction: "asc" }, accessors).map((row) => row.count);
    expect(asc).toEqual([2, 2, 9, 10, null]);
    const desc = sortItems(rows, { key: "count", direction: "desc" }, accessors).map((row) => row.count);
    expect(desc).toEqual([10, 9, 2, 2, null]);
  });

  it("es estable: los empates conservan el orden original", () => {
    const tied = sortItems(rows, { key: "count", direction: "asc" }, accessors).filter((row) => row.count === 2);
    expect(tied.map((row) => row.name)).toEqual(["alfa", "Fila 9"]);
  });

  it("no modifica la lista original", () => {
    const copy = [...rows];
    sortItems(rows, { key: "name", direction: "desc" }, accessors);
    expect(rows).toEqual(copy);
  });
});
