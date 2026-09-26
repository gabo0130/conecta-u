import { getCurrentLoading, loading } from "./loading";

describe("loading", () => {
  it("shows the most recent message and hides only when every action ended", () => {
    const stopSave = loading.start("Guardando…");
    const stopImport = loading.start("Importando…");
    expect(getCurrentLoading()?.message).toBe("Importando…");

    stopImport();
    expect(getCurrentLoading()?.message).toBe("Guardando…");

    stopSave();
    expect(getCurrentLoading()).toBeNull();
  });

  it("ignores a second call to the same stop function", () => {
    const stopA = loading.start("A");
    const stopB = loading.start("B");
    stopA();
    stopA();
    expect(getCurrentLoading()?.message).toBe("B");
    stopB();
  });

  it("run() returns the result and hides the overlay even when the task fails", async () => {
    await expect(loading.run(Promise.resolve(42), "Calculando…")).resolves.toBe(42);
    expect(getCurrentLoading()).toBeNull();

    await expect(loading.run(() => Promise.reject(new Error("falló")))).rejects.toThrow("falló");
    expect(getCurrentLoading()).toBeNull();
  });

  it("uses a default message", () => {
    const stop = loading.start();
    expect(getCurrentLoading()?.message).toBe("Cargando…");
    stop();
  });
});
