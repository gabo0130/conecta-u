import { act, renderHook, waitFor } from "@testing-library/react";
import { apiClient } from "@/apis/client";
import { httpError } from "@/modules/analysis/test-fixtures";
import { NEVER_GENERATED, RECOMMENDATIONS } from "../../test-fixtures";
import { useRecommendations } from "./useRecommendations";

jest.mock("@/apis/client", () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
  AI_REQUEST_CONFIG: { timeout: 60_000 },
}));

const get = jest.mocked(apiClient.get);
const post = jest.mocked(apiClient.post);
const put = jest.mocked(apiClient.put);

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

async function renderLoaded() {
  const hook = renderHook(() => useRecommendations("p1"));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe("useRecommendations", () => {
  it("carga las recomendaciones sin incluir no disponibles por defecto", async () => {
    get.mockResolvedValue({ data: RECOMMENDATIONS });
    const { result } = await renderLoaded();

    expect(get).toHaveBeenCalledWith("/projects/p1/recommendations", { params: { includeUnavailable: false } });
    expect(result.current.profiles).toHaveLength(2);
    expect(result.current.generatedAt).toBe(RECOMMENDATIONS.generatedAt);
  });

  it("si nunca se generaron, generatedAt es null y no es un error", async () => {
    get.mockResolvedValue({ data: NEVER_GENERATED });
    const { result } = await renderLoaded();

    expect(result.current.generatedAt).toBeNull();
    expect(result.current.error).toBe("");
  });

  it("muestra el error de carga del backend", async () => {
    get.mockRejectedValue(httpError(403, "No tienes acceso a este proyecto."));
    const { result } = await renderLoaded();

    expect(result.current.error).toBe("No tienes acceso a este proyecto.");
  });

  it("cambiar el filtro vuelve a pedir con includeUnavailable=true", async () => {
    get.mockResolvedValue({ data: RECOMMENDATIONS });
    const { result } = await renderLoaded();

    act(() => result.current.setIncludeUnavailable(true));
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith("/projects/p1/recommendations", { params: { includeUnavailable: true } }),
    );
  });

  it("descarta una respuesta vieja que llega después de la nueva", async () => {
    let resolveOld: (value: unknown) => void = () => undefined;
    get.mockReturnValueOnce(new Promise((resolve) => (resolveOld = resolve)));
    get.mockResolvedValueOnce({ data: { ...RECOMMENDATIONS, includeUnavailable: true } });
    const { result } = renderHook(() => useRecommendations("p1"));

    act(() => result.current.setIncludeUnavailable(true));
    await waitFor(() => expect(result.current.recommendations?.includeUnavailable).toBe(true));
    await act(async () => resolveOld({ data: NEVER_GENERATED }));

    expect(result.current.recommendations?.includeUnavailable).toBe(true);
  });

  it("generate() manda el filtro con el timeout de la IA y guarda el resultado", async () => {
    get.mockResolvedValue({ data: NEVER_GENERATED });
    post.mockResolvedValue({ data: RECOMMENDATIONS });
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.generate();
    });

    expect(post).toHaveBeenCalledWith("/projects/p1/recommendations", { includeUnavailable: false }, { timeout: 60_000 });
    expect(result.current.generatedAt).toBe(RECOMMENDATIONS.generatedAt);
    expect(result.current.isGenerating).toBe(false);
  });

  it("generate() propaga el 409 sin análisis y deja la vista como estaba", async () => {
    get.mockResolvedValue({ data: NEVER_GENERATED });
    post.mockRejectedValue(httpError(409, "Primero analiza el proyecto con IA para obtener los perfiles requeridos."));
    const { result } = await renderLoaded();

    await act(async () => {
      await expect(result.current.generate()).rejects.toThrow();
    });

    expect(result.current.generatedAt).toBeNull();
    expect(result.current.isGenerating).toBe(false);
  });

  it("registra la decisión y la aplica solo a esa tarjeta, sin recargar (tesis, T7)", async () => {
    get.mockResolvedValue({ data: RECOMMENDATIONS });
    const { result } = await renderLoaded();
    const target = result.current.profiles[0].recommendations[0];
    put.mockResolvedValue({
      data: {
        recommendationId: target.id,
        decision: "ACEPTADA",
        reason: null,
        rankAtDecision: target.rank,
        scoreAtDecision: target.score,
        decidedAt: "2026-11-02T00:00:00Z",
      },
    });

    await act(() => result.current.recordFeedback(target.id, { decision: "ACEPTADA" }));

    expect(put).toHaveBeenCalledWith(`/projects/p1/recommendations/${target.id}/feedback`, { decision: "ACEPTADA" });
    expect(get).toHaveBeenCalledTimes(1);
    expect(result.current.profiles[0].recommendations[0].feedback?.decision).toBe("ACEPTADA");
  });
});
