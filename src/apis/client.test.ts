import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { reportUnreachable } from "@/utils/service-status";
import { AI_REQUEST_CONFIG, apiClient, isTimeoutError } from "./client";
import { AI_REQUEST_TIMEOUT_MS, API_TIMEOUT_MS, positiveNumber } from "./client-config";

jest.mock("@/utils/service-status", () => ({ reportUnreachable: jest.fn() }));

const reportMock = jest.mocked(reportUnreachable);

// Adaptadores en lugar de la red. Un adaptador propio debe rechazar él mismo (axios no aplica validateStatus).
const respondWith =
  (status: number): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    const response = { status, statusText: "", data: { message: "falló" }, headers: {}, config };
    throw new AxiosError(`Request failed with status code ${status}`, "ERR_BAD_RESPONSE", config, null, response);
  };

const timeout: AxiosAdapter = async (config) => {
  throw new AxiosError("timeout of 60000ms exceeded", "ECONNABORTED", config);
};

const offline: AxiosAdapter = async (config) => {
  throw new AxiosError("Network Error", "ERR_NETWORK", config);
};

const aiPost = (adapter: AxiosAdapter) =>
  apiClient.post("/projects/p1/analysis", undefined, { ...AI_REQUEST_CONFIG, adapter });

beforeEach(() => reportMock.mockReset());

describe("apiClient y el aviso de servidor despertando", () => {
  it.each([
    ["un 503", respondWith(503)],
    ["un timeout", timeout],
    ["la falta de red", offline],
  ])("avisa con %s de una petición normal", async (_, adapter) => {
    await expect(apiClient.get("/projects", { adapter })).rejects.toBeInstanceOf(AxiosError);
    expect(reportMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["el 503 de la IA", respondWith(503)],
    ["el timeout de la IA", timeout],
  ])("no avisa con %s", async (_, adapter) => {
    await expect(aiPost(adapter)).rejects.toBeInstanceOf(AxiosError);
    expect(reportMock).not.toHaveBeenCalled();
  });

  it.each([
    ["un 502 del proxy", respondWith(502)],
    ["un 504 del proxy", respondWith(504)],
    ["la falta de red", offline],
  ])("en una petición de IA sí avisa con %s (no es la IA, es el servidor)", async (_, adapter) => {
    await expect(aiPost(adapter)).rejects.toBeInstanceOf(AxiosError);
    expect(reportMock).toHaveBeenCalledTimes(1);
  });

  it("no avisa si la petición se canceló a propósito", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(apiClient.get("/users", { signal: controller.signal, adapter: offline })).rejects.toThrow();
    expect(reportMock).not.toHaveBeenCalled();
  });

  it("las peticiones de IA usan su timeout largo; las demás, el normal", async () => {
    const seen: (number | undefined)[] = [];
    const capture: AxiosAdapter = async (config) => {
      seen.push(config.timeout);
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    };

    await apiClient.post("/projects/p1/recommendations", {}, { ...AI_REQUEST_CONFIG, adapter: capture });
    await apiClient.get("/users", { adapter: capture });

    expect(seen).toEqual([AI_REQUEST_TIMEOUT_MS, API_TIMEOUT_MS]);
    expect(seen[0]).toBeGreaterThan(seen[1]!);
  });

  it("toma los tiempos de las variables de entorno y, si faltan o son inválidas, usa los por defecto", () => {
    expect(positiveNumber("90000", 60_000)).toBe(90_000);
    expect(positiveNumber(undefined, 60_000)).toBe(60_000);
    expect(positiveNumber("abc", 60_000)).toBe(60_000);
    expect(positiveNumber("-5", 60_000)).toBe(60_000);
  });
});

describe("isTimeoutError", () => {
  it("distingue el timeout de la falta de red", () => {
    const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };
    expect(isTimeoutError(new AxiosError("timeout", "ECONNABORTED", config))).toBe(true);
    expect(isTimeoutError(new AxiosError("Network Error", "ERR_NETWORK", config))).toBe(false);
  });
});
