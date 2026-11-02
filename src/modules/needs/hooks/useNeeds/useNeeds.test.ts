import { act, renderHook, waitFor } from "@testing-library/react";
import { apiClient } from "@/apis/client";
import { useNeeds } from "./useNeeds";

jest.mock("@/apis/client", () => ({ apiClient: { get: jest.fn() } }));

const get = jest.mocked(apiClient.get);
const PAGE = { needs: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 } };

beforeEach(() => get.mockReset());

describe("useNeeds", () => {
  it("pide por prioridad por defecto y vuelve a la página 1 al filtrar", async () => {
    get.mockResolvedValue({ data: PAGE });
    const { result } = renderHook(() => useNeeds());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(get).toHaveBeenLastCalledWith("/needs", { params: { page: 1, pageSize: 20, sort: "priority" } });

    act(() => result.current.setPage(3));
    await waitFor(() => expect(get).toHaveBeenLastCalledWith("/needs", { params: { page: 3, pageSize: 20, sort: "priority" } }));
    act(() => result.current.setStatus("CARACTERIZADA"));
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith("/needs", {
        params: { page: 1, pageSize: 20, sort: "priority", status: "CARACTERIZADA" },
      }),
    );
    act(() => result.current.setSort("recent"));
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith("/needs", {
        params: { page: 1, pageSize: 20, sort: "recent", status: "CARACTERIZADA" },
      }),
    );
  });

  it("muestra el error de carga en español", async () => {
    get.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useNeeds());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBe("");
  });
});
