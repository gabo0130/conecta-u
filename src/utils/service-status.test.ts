type ServiceModule = typeof import("./service-status");

const okResponse = () => ({ ok: true, status: 200, json: async () => ({ status: "ok" }) });
const statusResponse = (status: number) => ({ ok: false, status, json: async () => ({}) });

// Cada prueba usa una instancia nueva del módulo: el estado vive a nivel de módulo.
async function loadModule(): Promise<ServiceModule> {
  jest.resetModules();
  return import("./service-status");
}

const fetchMock = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  jest.useRealTimers();
});

describe("service-status", () => {
  it("stays hidden and ends online when /health answers quickly", async () => {
    fetchMock.mockResolvedValue(okResponse());
    const service = await loadModule();

    service.checkService();
    await jest.advanceTimersByTimeAsync(0);

    expect(service.getServiceState()).toMatchObject({ status: "online", recovered: false, attempts: 1 });
  });

  it("shows the waking notice when the answer takes more than 4 s, then marks it as recovered", async () => {
    fetchMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(okResponse()), 6000)),
    );
    const service = await loadModule();

    service.checkService();
    await jest.advanceTimersByTimeAsync(4100);
    expect(service.getServiceState().status).toBe("waking");

    await jest.advanceTimersByTimeAsync(2000);
    expect(service.getServiceState()).toMatchObject({ status: "online", recovered: true });
  });

  it("keeps retrying after network errors and 503 until the server answers", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(statusResponse(503))
      .mockResolvedValue(okResponse());
    const service = await loadModule();

    service.checkService();
    await jest.advanceTimersByTimeAsync(0);
    expect(service.getServiceState()).toMatchObject({ status: "waking", attempts: 1 });

    await jest.advanceTimersByTimeAsync(3000); // primer reintento: 503
    expect(service.getServiceState()).toMatchObject({ status: "waking", attempts: 2 });

    await jest.advanceTimersByTimeAsync(5000); // segundo reintento: responde
    expect(service.getServiceState()).toMatchObject({ status: "online", attempts: 3, recovered: true });
  });

  it("gives up after 6 minutes and lets the user retry", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const service = await loadModule();

    service.checkService();
    await jest.advanceTimersByTimeAsync(6 * 60 * 1000 + 15000);
    expect(service.getServiceState().status).toBe("offline");

    fetchMock.mockResolvedValue(okResponse());
    service.retryNow();
    await jest.advanceTimersByTimeAsync(0);
    expect(service.getServiceState()).toMatchObject({ status: "online", recovered: true });
  });

  it("starts waking when a request of the app fails while it looked online", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    const service = await loadModule();
    service.checkService();
    await jest.advanceTimersByTimeAsync(0);
    expect(service.getServiceState().status).toBe("online");

    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValue(okResponse());
    service.reportUnreachable();
    await jest.advanceTimersByTimeAsync(0);
    expect(service.getServiceState().status).toBe("waking");

    await jest.advanceTimersByTimeAsync(3000);
    expect(service.getServiceState()).toMatchObject({ status: "online", recovered: true });
  });

  it("diagnose reports the latency when the server is up", async () => {
    fetchMock.mockResolvedValue(okResponse());
    const service = await loadModule();

    const result = await service.diagnose();

    expect(result.ok).toBe(true);
    expect(service.getServiceState().status).toBe("online");
  });

  it("diagnose explains a timeout", async () => {
    fetchMock.mockRejectedValue(new DOMException("Timeout", "TimeoutError"));
    const service = await loadModule();

    const result = await service.diagnose();

    expect(result).toMatchObject({ ok: false, reason: "El servidor no respondió a tiempo." });
    expect(service.getServiceState().status).toBe("waking");
  });
});
