import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { reportUnreachable } from "@/utils/service-status";
import { AI_REQUEST_CONFIG, apiClient, isTimeoutError } from "./client";

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

  it("usa 60 s solo en las peticiones de IA", () => {
    expect(apiClient.defaults.timeout).toBe(15000);
    expect(AI_REQUEST_CONFIG.timeout).toBe(60000);
  });
});

describe("isTimeoutError", () => {
  it("distingue el timeout de la falta de red", () => {
    const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };
    expect(isTimeoutError(new AxiosError("timeout", "ECONNABORTED", config))).toBe(true);
    expect(isTimeoutError(new AxiosError("Network Error", "ERR_NETWORK", config))).toBe(false);
  });
});
