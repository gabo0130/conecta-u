import { act, renderHook, waitFor } from "@testing-library/react";
import { apiClient } from "@/apis/client";
import { ANALYSIS, httpError } from "../../test-fixtures";
import { useProjectAnalysis } from "./useProjectAnalysis";

jest.mock("@/apis/client", () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
  AI_REQUEST_CONFIG: {},
  isTimeoutError: jest.requireActual("@/apis/client").isTimeoutError,
}));

const get = jest.mocked(apiClient.get);
const post = jest.mocked(apiClient.post);

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

async function renderLoaded() {
  const hook = renderHook(() => useProjectAnalysis("p1"));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe("useProjectAnalysis", () => {
  it("un 404 significa que aún no hay análisis, no es un error", async () => {
    get.mockRejectedValue(httpError(404, "Este proyecto aún no tiene un análisis."));
    const { result } = await renderLoaded();

    expect(result.current.analysis).toBeNull();
    expect(result.current.hasAnalysis).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("muestra el error si la carga falla por otra causa", async () => {
    get.mockRejectedValue(httpError(500, "Error interno"));
    const { result } = await renderLoaded();

    expect(result.current.error).toBe("Error interno");
  });

  it("expone el análisis con su marca de desactualizado", async () => {
    get.mockResolvedValue({ data: { ...ANALYSIS, outdated: true } });
    const { result } = await renderLoaded();

    expect(result.current.analysis?.outdated).toBe(true);
    expect(result.current.analysis?.profiles).toHaveLength(2);
  });

  it("analyze() pasa por 'analizando' y guarda el resultado", async () => {
    get.mockRejectedValue(httpError(404, "sin análisis"));
    let resolvePost: (value: unknown) => void = () => undefined;
    post.mockReturnValue(new Promise((resolve) => (resolvePost = resolve)));
    const { result } = await renderLoaded();

    let analyzing: Promise<boolean> = Promise.resolve(false);
    act(() => {
      analyzing = result.current.analyze();
    });
    expect(result.current.isAnalyzing).toBe(true);

    await act(async () => {
      resolvePost({ data: ANALYSIS });
      await analyzing;
    });
    expect(result.current.analyzeState).toBe("idle");
    expect(result.current.analysis).toBe(ANALYSIS);
  });

  it.each([
    [503, "El servicio de análisis no está disponible. Intenta de nuevo en unos minutos."],
    [409, "Ya hay un análisis en curso para este proyecto."],
    [422, "El proyecto necesita título, resumen y objetivos para poder analizarse."],
  ])("con un %i deja el mensaje del backend tal cual y no cuelga el estado", async (status, message) => {
    get.mockRejectedValue(httpError(404, "sin análisis"));
    post.mockRejectedValue(httpError(status, message));
    const { result } = await renderLoaded();

    let ok = true;
    await act(async () => {
      ok = await result.current.analyze();
    });
    expect(ok).toBe(false);
    expect(result.current.analyzeState).toBe("error");
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.analyzeError).toBe(message);
  });
});
