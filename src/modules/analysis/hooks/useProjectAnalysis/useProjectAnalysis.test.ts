import { act, renderHook, waitFor } from "@testing-library/react";
import { ANALYSIS, httpError } from "../../test-fixtures";
import {
  fetchLatestAnalysis,
  findRunningAnalysis,
  requestAnalysis,
  waitForAnalysis,
} from "../../utils/request-analysis";
import { useProjectAnalysis } from "./useProjectAnalysis";

jest.mock("../../utils/request-analysis", () => ({
  fetchLatestAnalysis: jest.fn(),
  findRunningAnalysis: jest.fn(),
  requestAnalysis: jest.fn(),
  waitForAnalysis: jest.fn(),
}));

const fetchLatest = jest.mocked(fetchLatestAnalysis);
const findRunning = jest.mocked(findRunningAnalysis);
const request = jest.mocked(requestAnalysis);
const wait = jest.mocked(waitForAnalysis);

beforeEach(() => {
  jest.resetAllMocks();
  fetchLatest.mockResolvedValue(null);
  findRunning.mockResolvedValue(null);
});

async function renderLoaded(onSettled?: (ok: boolean) => void) {
  const hook = renderHook(() => useProjectAnalysis("p1", onSettled));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe("useProjectAnalysis", () => {
  it("sin análisis aún: analysis queda en null y no es un error", async () => {
    const { result } = await renderLoaded();

    expect(result.current.analysis).toBeNull();
    expect(result.current.hasAnalysis).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("muestra el error si la carga falla", async () => {
    fetchLatest.mockRejectedValue(httpError(500, "Error interno"));
    const { result } = await renderLoaded();

    expect(result.current.error).toBe("Error interno");
  });

  it("analyze() pasa por 'analizando', guarda el resultado y avisa que terminó", async () => {
    let finish: (value: typeof ANALYSIS) => void = () => undefined;
    request.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const onSettled = jest.fn();
    const { result } = await renderLoaded(onSettled);

    let analyzing: Promise<boolean> = Promise.resolve(false);
    act(() => {
      analyzing = result.current.analyze();
    });
    expect(result.current.isAnalyzing).toBe(true);
    expect(result.current.analyzingSince).toEqual(expect.any(Number));

    await act(async () => {
      finish(ANALYSIS);
      await analyzing;
    });
    expect(result.current.analyzeState).toBe("idle");
    expect(result.current.analysis).toBe(ANALYSIS);
    expect(onSettled).toHaveBeenCalledWith(true);
  });

  it.each([
    [503, "El servicio de análisis no está disponible. Intenta de nuevo en unos minutos."],
    [409, "Ya hay un análisis en curso para este proyecto."],
    [422, "El proyecto necesita título, resumen y objetivos para poder analizarse."],
  ])("con un %i deja el mensaje del backend tal cual y no cuelga el estado", async (status, message) => {
    request.mockRejectedValue(httpError(status, message));
    const onSettled = jest.fn();
    const { result } = await renderLoaded(onSettled);

    let ok = true;
    await act(async () => {
      ok = await result.current.analyze();
    });
    expect(ok).toBe(false);
    expect(result.current.analyzeState).toBe("error");
    expect(result.current.analyzeError).toBe(message);
    expect(onSettled).toHaveBeenCalledWith(false);
  });

  it("al volver a la página retoma el análisis que sigue corriendo en el servidor", async () => {
    findRunning.mockResolvedValue({ ...ANALYSIS, id: "a9", status: "PENDIENTE", createdAt: "2026-11-19T12:00:00Z" });
    wait.mockResolvedValue({ ...ANALYSIS, id: "a9" });
    const onSettled = jest.fn();

    const { result } = renderHook(() => useProjectAnalysis("p1", onSettled));

    await waitFor(() => expect(result.current.analysis?.id).toBe("a9"));
    expect(wait).toHaveBeenCalledWith("p1", "a9", { signal: expect.any(AbortSignal) });
    expect(onSettled).toHaveBeenCalledWith(true);
  });

  it("al salir de la página deja de consultar sin marcar error", async () => {
    findRunning.mockResolvedValue({ ...ANALYSIS, id: "a9", status: "PENDIENTE" });
    let signal: AbortSignal | undefined;
    wait.mockImplementation(
      (_projectId, _id, options) =>
        new Promise((_, reject) => {
          signal = options?.signal;
          signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    const onSettled = jest.fn();
    const { result, unmount } = renderHook(() => useProjectAnalysis("p1", onSettled));
    await waitFor(() => expect(result.current.isAnalyzing).toBe(true));

    unmount();

    expect(signal?.aborted).toBe(true);
    await Promise.resolve();
    expect(onSettled).not.toHaveBeenCalled();
  });
});
