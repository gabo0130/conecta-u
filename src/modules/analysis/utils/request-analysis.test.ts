import { apiClient } from "@/apis/client";
import { ANALYSIS, httpError, offlineError } from "../test-fixtures";
import {
  ANALYSIS_FAILED_MESSAGE,
  fetchLatestAnalysis,
  findRunningAnalysis,
  requestAnalysis,
  waitForAnalysis,
} from "./request-analysis";

jest.mock("@/apis/client", () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));

const get = jest.mocked(apiClient.get);
const post = jest.mocked(apiClient.post);
const now = { intervalMs: 0 };
const pending = { ...ANALYSIS, status: "PENDIENTE" as const, profiles: [] };

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

describe("requestAnalysis (análisis en segundo plano)", () => {
  it("pide el análisis (202, PENDIENTE) y consulta el intento hasta que termina", async () => {
    post.mockResolvedValue({ data: { ...pending, id: "a2" } });
    get.mockResolvedValueOnce({ data: pending }).mockResolvedValueOnce({ data: { ...ANALYSIS, id: "a2" } });

    await expect(requestAnalysis("p1", now)).resolves.toMatchObject({ id: "a2", status: "COMPLETADO" });
    expect(post).toHaveBeenCalledWith("/projects/p1/analysis");
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenLastCalledWith("/projects/p1/analyses/a2", { signal: undefined });
  });

  it("con un error del POST (503, 409, 422, sin red) no consulta y lo propaga tal cual", async () => {
    const error = httpError(409, "Ya hay un análisis en curso para este proyecto.");
    post.mockRejectedValue(error);

    await expect(requestAnalysis("p1", now)).rejects.toBe(error);
    expect(get).not.toHaveBeenCalled();
  });
});

describe("waitForAnalysis", () => {
  it("si el análisis falla en el servidor, muestra el mensaje que guardó el backend", async () => {
    get.mockResolvedValue({
      data: { ...pending, status: "ERROR", errorMessage: "El servicio de análisis no está disponible." },
    });

    await expect(waitForAnalysis("p1", "a1", now)).rejects.toThrow("El servicio de análisis no está disponible.");
  });

  it("si el backend no dejó mensaje, usa uno genérico", async () => {
    get.mockResolvedValue({ data: { ...pending, status: "ERROR", errorMessage: null } });

    await expect(waitForAnalysis("p1", "a1", now)).rejects.toThrow(ANALYSIS_FAILED_MESSAGE);
  });

  it("aguanta cortes de red pasajeros: el análisis sigue en el servidor", async () => {
    get
      .mockRejectedValueOnce(offlineError())
      .mockRejectedValueOnce(offlineError())
      .mockResolvedValueOnce({ data: ANALYSIS });

    await expect(waitForAnalysis("p1", "a1", now)).resolves.toBe(ANALYSIS);
  });

  it("se rinde tras varias consultas fallidas seguidas", async () => {
    const error = offlineError();
    get.mockRejectedValue(error);

    await expect(waitForAnalysis("p1", "a1", now)).rejects.toBe(error);
    expect(get).toHaveBeenCalledTimes(5);
  });

  it("un 4xx no se arregla esperando: falla de una vez", async () => {
    const error = httpError(404, "Análisis no encontrado.");
    get.mockRejectedValue(error);

    await expect(waitForAnalysis("p1", "a1", now)).rejects.toBe(error);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("deja de consultar al salir de la página", async () => {
    const controller = new AbortController();
    get.mockResolvedValue({ data: pending });

    const waiting = waitForAnalysis("p1", "a1", { signal: controller.signal, intervalMs: 5 });
    controller.abort();

    await expect(waiting).rejects.toBeDefined();
    expect(get).not.toHaveBeenCalled();
  });
});

describe("findRunningAnalysis", () => {
  it("devuelve el último intento si sigue PENDIENTE", async () => {
    get.mockResolvedValue({ data: { analyses: [pending], meta: {} } });

    await expect(findRunningAnalysis("p1")).resolves.toMatchObject({ id: "a1" });
    expect(get).toHaveBeenCalledWith("/projects/p1/analyses", { params: { page: 1, pageSize: 1 } });
  });

  it("null si el último ya terminó o no hay ninguno", async () => {
    get.mockResolvedValueOnce({ data: { analyses: [ANALYSIS], meta: {} } });
    await expect(findRunningAnalysis("p1")).resolves.toBeNull();

    get.mockResolvedValueOnce({ data: { analyses: [], meta: {} } });
    await expect(findRunningAnalysis("p1")).resolves.toBeNull();
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
