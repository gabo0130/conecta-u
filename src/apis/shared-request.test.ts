import { apiClient } from "./client";
import { createSharedRequest } from "./shared-request";

jest.mock("./client", () => ({ apiClient: { get: jest.fn() } }));

const get = jest.mocked(apiClient.get);

beforeEach(() => get.mockReset());

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
});
