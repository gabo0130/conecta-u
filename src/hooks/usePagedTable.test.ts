import { act, renderHook, waitFor } from "@testing-library/react";
import { fetchAllPages } from "@/apis/fetch-all-pages";
import type { SortAccessors } from "@/utils/sort";
import { usePagedTable } from "./usePagedTable";
import type { ServerPage } from "./usePagedTable";

jest.mock("@/apis/fetch-all-pages", () => ({ fetchAllPages: jest.fn() }));

const fetchAll = jest.mocked(fetchAllPages);

type Row = { id: string; name: string };
const ACCESSORS: SortAccessors<Row, "name"> = { name: (row) => row.name };

const serverRows: Row[] = [
  { id: "1", name: "Carla" },
  { id: "2", name: "ana" },
];
const allRows: Row[] = [...serverRows, { id: "3", name: "Beto" }];

const server: ServerPage<Row> = {
  items: serverRows,
  meta: { page: 1, pageSize: 2, total: 3, totalPages: 2 },
  setPage: jest.fn(),
  isLoading: false,
  error: "",
  reload: jest.fn().mockResolvedValue(undefined),
};

function setup() {
  return renderHook(() =>
    usePagedTable({ server, url: "/rows", key: "rows", errorMessage: "No se pudo ordenar.", accessors: ACCESSORS, pageSize: 2 }),
  );
}

beforeEach(() => fetchAll.mockReset());

describe("usePagedTable", () => {
  it("sin orden muestra la página del backend y no trae el resto", () => {
    const { result } = setup();
    expect(result.current.rows).toBe(serverRows);
    expect(result.current.meta).toBe(server.meta);
    expect(fetchAll).not.toHaveBeenCalled();
  });

  it("al ordenar mantiene las filas del backend mientras llega todo, y luego ordena el total", async () => {
    let resolve: (rows: Row[]) => void = () => {};
    fetchAll.mockReturnValue(new Promise((done) => (resolve = done)));
    const { result } = setup();

    act(() => result.current.toggleSort("name"));
    expect(result.current.rows).toBe(serverRows);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);

    await act(async () => resolve(allRows));
    expect(result.current.rows.map((row) => row.name)).toEqual(["ana", "Beto"]);
    expect(result.current.meta).toEqual({ page: 1, pageSize: 2, total: 3, totalPages: 2 });
    expect(result.current.isRefreshing).toBe(false);
  });

  it("si falla al traer todo, avisa y deja quitar el orden para volver a la página del backend", async () => {
    fetchAll.mockRejectedValue(new Error("caído"));
    const { result } = setup();

    act(() => result.current.toggleSort("name"));
    await waitFor(() => expect(result.current.error).not.toBe(""));
    expect(result.current.rows).toBe(serverRows);

    act(() => result.current.clearSort());
    expect(result.current.error).toBe("");
    expect(result.current.rows).toBe(serverRows);
  });

  it("tras guardar vuelve a traer todo sin dejar de mostrar las filas anteriores", async () => {
    fetchAll.mockResolvedValue(allRows);
    const { result } = setup();
    act(() => result.current.toggleSort("name"));
    await waitFor(() => expect(result.current.isRefreshing).toBe(false));

    fetchAll.mockResolvedValue([...allRows, { id: "4", name: "Aldo" }]);
    await act(() => result.current.withRefresh(async () => {})());
    await waitFor(() => expect(result.current.rows.map((row) => row.name)).toEqual(["Aldo", "ana"]));
    expect(result.current.isLoading).toBe(false);
  });
});
