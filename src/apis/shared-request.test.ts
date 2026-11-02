import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { apiClient } from "./client";
import { createSharedRequest } from "./shared-request";

jest.mock("./client", () => ({ apiClient: { get: jest.fn() } }));

const get = jest.mocked(apiClient.get);
const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };

const offline = () => new AxiosError("Network Error", "ERR_NETWORK", config);
const withStatus = (status: number) =>
  new AxiosError(`Request failed with status code ${status}`, "ERR_BAD_RESPONSE", config, null, {
    status,
    statusText: "",
    data: { message: "falló" },
    headers: {},
    config,
  });

beforeEach(() => get.mockReset());
afterEach(() => jest.useRealTimers());

describe("createSharedRequest", () => {
  it("asks the backend once for every caller", async () => {
    get.mockResolvedValue({ data: { programs: [1] } });
    const request = createSharedRequest<{ programs: number[] }>("/catalogs/programs");

    const [first, second] = await Promise.all([request.get(), request.get()]);

    expect(get).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("forgets a failed response so the next call retries", async () => {
    get.mockRejectedValueOnce(new Error("sin red")).mockResolvedValueOnce({ data: "ok" });
    const request = createSharedRequest<string>("/catalogs/project-types");

    await expect(request.get()).rejects.toThrow("sin red");
    await expect(request.get()).resolves.toBe("ok");
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("asks again when refresh is requested", async () => {
    get.mockResolvedValue({ data: "ok" });
    const request = createSharedRequest<string>("/catalogs/project-categories");

    await request.get();
    await request.get({ refresh: true });

    expect(get).toHaveBeenCalledTimes(2);
  });

  it("reintenta solo ante un fallo pasajero (sin red o 503) y entrega la respuesta", async () => {
    jest.useFakeTimers();
    get.mockRejectedValueOnce(offline()).mockRejectedValueOnce(withStatus(503)).mockResolvedValueOnce({ data: "ok" });
    const request = createSharedRequest<string>("/catalogs/programs");

    const result = request.get();
    await jest.advanceTimersByTimeAsync(4000);

    await expect(result).resolves.toBe("ok");
    expect(get).toHaveBeenCalledTimes(3);
  });

  it("se rinde tras dos reintentos y deja que la próxima llamada vuelva a pedir", async () => {
    jest.useFakeTimers();
    get.mockRejectedValue(offline());
    const request = createSharedRequest<string>("/catalogs/programs");

    const result = request.get();
    const settled = expect(result).rejects.toThrow("Network Error");
    await jest.advanceTimersByTimeAsync(4000);
    await settled;
    expect(get).toHaveBeenCalledTimes(3);
  });

  it("no reintenta un error del cliente (4xx)", async () => {
    get.mockRejectedValue(withStatus(404));
    const request = createSharedRequest<string>("/catalogs/programs");

    await expect(request.get()).rejects.toBeInstanceOf(AxiosError);
    expect(get).toHaveBeenCalledTimes(1);
  });
});
