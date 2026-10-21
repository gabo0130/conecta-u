import { apiClient } from "@/apis/client";
import { ANALYSIS, httpError, offlineError, timeoutError } from "../test-fixtures";
import { ANALYSIS_TIMEOUT_MESSAGE, fetchLatestAnalysis, requestAnalysis } from "./request-analysis";

jest.mock("@/apis/client", () => {
  const actual = jest.requireActual("@/apis/client");
  return {
    apiClient: { get: jest.fn(), post: jest.fn() },
    AI_REQUEST_CONFIG: { timeout: 60000, aiRequest: true },
    isTimeoutError: actual.isTimeoutError,
  };
});

const get = jest.mocked(apiClient.get);
const post = jest.mocked(apiClient.post);

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

describe("requestAnalysis", () => {
  it("pide el análisis con la configuración de IA", async () => {
    post.mockResolvedValue({ data: ANALYSIS });

    await expect(requestAnalysis("p1", null)).resolves.toBe(ANALYSIS);
    expect(post).toHaveBeenCalledWith("/projects/p1/analysis", undefined, { timeout: 60000, aiRequest: true });
  });

  it("si se corta por timeout, usa el análisis que terminó en el servidor", async () => {
    post.mockRejectedValue(timeoutError());
    get.mockResolvedValue({ data: { ...ANALYSIS, id: "a2" } });

    await expect(requestAnalysis("p1", "a1")).resolves.toMatchObject({ id: "a2" });
    expect(get).toHaveBeenCalledWith("/projects/p1/analysis");
  });

  it("si tras el timeout sigue el mismo análisis, avisa que está tardando", async () => {
    post.mockRejectedValue(timeoutError());
    get.mockResolvedValue({ data: ANALYSIS });

    await expect(requestAnalysis("p1", "a1")).rejects.toThrow(ANALYSIS_TIMEOUT_MESSAGE);
  });

  it("si tras el timeout la consulta de respaldo falla, muestra el error original", async () => {
    const original = timeoutError();
    post.mockRejectedValue(original);
    get.mockRejectedValue(offlineError());

    await expect(requestAnalysis("p1", "a1")).rejects.toBe(original);
  });

  it("sin red no dice que está tardando ni consulta de nuevo: propaga el error de red", async () => {
    const error = offlineError();
    post.mockRejectedValue(error);

    await expect(requestAnalysis("p1", null)).rejects.toBe(error);
    expect(get).not.toHaveBeenCalled();
  });

  it("con una respuesta de error (503, 409, 422) no consulta de nuevo y deja el error del backend", async () => {
    const error = httpError(503, "El servicio de análisis no está disponible.");
    post.mockRejectedValue(error);

    await expect(requestAnalysis("p1", null)).rejects.toBe(error);
    expect(get).not.toHaveBeenCalled();
  });
});

describe("fetchLatestAnalysis", () => {
  it("convierte el 404 (aún sin análisis) en null", async () => {
    get.mockRejectedValue(httpError(404, "Este proyecto aún no tiene un análisis."));
    await expect(fetchLatestAnalysis("p1")).resolves.toBeNull();
  });

  it("propaga los demás errores", async () => {
    const error = httpError(500, "falló");
    get.mockRejectedValue(error);
    await expect(fetchLatestAnalysis("p1")).rejects.toBe(error);
  });
});
