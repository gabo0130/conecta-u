import { act, renderHook, waitFor } from "@testing-library/react";
import type { SharedRequest } from "@/apis/shared-request";
import type { ServiceStatus } from "@/utils/service-status";
import { useSharedCatalog } from "./useSharedCatalog";

// Estado del servidor controlado por la prueba.
let status: ServiceStatus = "waking";
const listeners = new Set<() => void>();
jest.mock("@/utils/service-status", () => ({
  getServiceState: () => ({ status }),
  subscribeServiceStatus: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
}));

function setStatus(next: ServiceStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

const select = (data: { items: string[] }) => data.items;

function setup(get: SharedRequest<{ items: string[] }>["get"]) {
  const request: SharedRequest<{ items: string[] }> = { get, clear: jest.fn() };
  return renderHook(() => useSharedCatalog(request, select, "No se pudieron cargar los programas."));
}

beforeEach(() => {
  status = "waking";
  listeners.clear();
});

describe("useSharedCatalog", () => {
  it("si falló, se recarga solo cuando el servidor vuelve a estar en línea", async () => {
    const get = jest.fn().mockRejectedValueOnce(new Error("sin red")).mockResolvedValueOnce({ items: ["Sistemas"] });
    const { result } = setup(get);
    await waitFor(() => expect(result.current.error).not.toBe(""));

    act(() => setStatus("online"));

    await waitFor(() => expect(result.current.items).toEqual(["Sistemas"]));
    expect(result.current.error).toBe("");
    expect(get).toHaveBeenLastCalledWith({ refresh: true });
  });

  it("si cargó bien, no vuelve a pedir al cambiar el estado del servidor", async () => {
    const get = jest.fn().mockResolvedValue({ items: ["Sistemas"] });
    const { result } = setup(get);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => setStatus("online"));

    expect(get).toHaveBeenCalledTimes(1);
  });
});
